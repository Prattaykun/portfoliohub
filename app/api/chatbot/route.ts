
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

// Initialize Gemini (for Audio)
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey!);

// Initialize Groq (for Text)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- User Data Fetching Logic ---

async function fetchUserData(username: string) {
    try {
        // Fetch User and Chatbot Info
        const { data: usernameData, error: usernameError } = await supabase
            .from("users_usernames")
            .select("auth_user_id, chatbot_info")
            .ilike("username", username)
            .single();

        if (usernameError || !usernameData) {
            return { data: null, error: "User not found" };
        }

        const userId = usernameData.auth_user_id;

        const [
            { data: profile },
            { data: about },
            { data: skills },
            { data: projects },
            { data: contact },
            { data: langint },
            { data: resume },
        ] = await Promise.all([
            supabase.from("user_profiles").select("*").eq("uid", userId).single(),
            supabase.from("about").select("*").eq("auth_user_id", userId).single(),
            supabase.from("skills").select("*").eq("auth_user_id", userId).single(),
            supabase.from("project").select("*").eq("id", userId).single(),
            supabase.from("contact").select("*").eq("auth_user_id", userId).single(),
            supabase.from("langint").select("*").eq("auth_user_id", userId).single(),
            supabase.from("resumes").select("*").eq("auth_user_id", userId).single(),
        ]);

        return {
            data: {
                profile,
                about,
                skills,
                projects,
                contact,
                langint,
                resume,
                chatbot_info: usernameData.chatbot_info
            },
            error: null,
        };
    } catch (err) {
        console.error("Error fetching user data:", err);
        return { data: null, error: "Failed to load portfolio data" };
    }
}

// --- API Route Handler ---

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, message, audio, history } = body;

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        // 1. Fetch User Data for Context
        const { data: userData, error: userError } = await fetchUserData(username);

        if (userError || !userData) {
            return NextResponse.json({ error: userError || "User not found" }, { status: 404 });
        }

        // 2. Prepare System Prompt
        const systemPrompt = `
You are an advanced, agentic AI assistant for **${userData.profile?.full_name || "this user"}**.
You are answering questions from a visitor to their portfolio website.

### Context & Persona
- **User's Additional Prompt**: "${userData.chatbot_info || "No specific instructions provided."}"
- Access the full portfolio data below to answer accurately.
- Be professional, engaging, and helpful. Adopt the user's voice if appropriate.

### Formatting Rules (CRITICAL)
- **Bold** key terms and important takeaways.
- Use **Markdown** for all formatting (lists, headers, bold, italics).
- **Links**: When mentioning a specific project, section, or valid URL, YOU MUST format it as a clickable Markdown link/button.
  - **IMPORTANT**: For section links, ALWAYS use the hash format: \`${process.env.NEXT_PUBLIC_APP_URL}/${username}#section-name\` (e.g., #experience, #projects, #contact). DO NOT use /section-name.
  - Format: \`[Link Label](URL)\`
  - Example: "Check out the [Portfolio Project](${process.env.NEXT_PUBLIC_APP_URL}/${username}/project/123)"
  - Example: "See the [Experience Section](${process.env.NEXT_PUBLIC_APP_URL}/${username}#experience)"
- **Do not** output raw URLs. Always wrap them in markdown links.

### Portfolio Data
${JSON.stringify(userData, null, 2)}

### Conversation History
${JSON.stringify(history?.slice(-5) || [])}
`;

        let answer = "";

        if (audio) {
            // --- Gemini (Native Audio) ---
            try {
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    systemInstruction: systemPrompt
                });

                const result = await model.generateContent([
                    { inlineData: { data: audio, mimeType: "audio/webm" } },
                    { text: "Listen to the audio and answer the user's question." }
                ]);

                answer = result.response.text();
            } catch (geminiError) {
                console.error("Gemini failed, switching to Groq:", geminiError);

                try {
                    // Fallback: Transcribe audio with Groq (Whisper) -> Text Response with Groq (Llama)

                    // Convert base64 audio to a File-like object for Groq
                    const audioBuffer = Buffer.from(audio, "base64");
                    // Create a File object (supported in Node 20+ and Next.js Edge/Node runtimes)
                    const audioFile = new File([audioBuffer], "audio.webm", { type: "audio/webm" });

                    const transcriptionCompletion = await groq.audio.transcriptions.create({
                        file: audioFile,
                        model: "distil-whisper-large-v3-en",
                        response_format: "json",
                        language: "en",
                        temperature: 0.0,
                    });

                    const transcribedText = transcriptionCompletion.text;
                    console.log("Transcribed text (fallback):", transcribedText);

                    if (!transcribedText) {
                        throw new Error("Empty transcription from Groq");
                    }

                    // Generate response using transcribed text
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: transcribedText } // Use transcribed text
                        ],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.7,
                        max_tokens: 2048,
                    });

                    answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response (fallback).";

                } catch (groqError) {
                    console.error("Groq fallback failed:", groqError);
                    // Return the original Gemini error if fallback also fails, or a generic error
                    throw geminiError; // Propagate the original error or handle gracefully
                }
            }

        } else if (message) {
            // --- Groq (Text Only) ---
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 2048, // Increased from 1024 to prevent cutoff
            });

            answer = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
        } else {
            return NextResponse.json({ error: "Message or Audio is required" }, { status: 400 });
        }

        return NextResponse.json({ answer });

    } catch (error: any) {
        console.error("Chatbot API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
