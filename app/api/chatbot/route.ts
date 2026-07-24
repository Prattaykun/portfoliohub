import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import {
    GEMINI_MODELS,
    modelFallbackOrder,
    providerFallbackOrder,
    type ChatbotProvider,
} from "@/lib/chatbotModels";
import { getChatbotConfig } from "@/lib/server/getChatbotConfig";

// Initialize Gemini (for Audio + text)
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey!);

// Initialize Groq (for Text + Whisper)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const vertexApiKey = process.env.VERTEX_API_KEY;

// Initialize Supabase client (portfolio data)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- User Data Fetching Logic ---

async function fetchUserData(username: string) {
    try {
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

async function generateWithGroq(systemPrompt: string, userMessage: string, modelId: string) {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        model: modelId,
        temperature: 0.7,
        max_tokens: 2048,
    });
    return completion.choices[0]?.message?.content || null;
}

async function generateWithGemini(systemPrompt: string, userMessage: string, modelId: string) {
    const model = genAI.getGenerativeModel({
        model: modelId,
        systemInstruction: systemPrompt
    });
    const result = await model.generateContent(userMessage);
    return result.response.text() || null;
}

async function generateWithVertex(systemPrompt: string, userMessage: string, modelId: string) {
    if (!vertexApiKey) {
        throw new Error("VERTEX_API_KEY is not configured");
    }

    const url =
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${encodeURIComponent(modelId)}:generateContent` +
        `?key=${encodeURIComponent(vertexApiKey)}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
                {
                    role: "user",
                    parts: [{ text: userMessage }],
                },
            ],
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error?.message || `Vertex AI error (${res.status})`);
    }

    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
        ? parts.map((p: { text?: string }) => p?.text || "").join("")
        : "";
    return text || null;
}

async function generateForProvider(
    provider: ChatbotProvider,
    systemPrompt: string,
    userMessage: string,
    modelId: string
) {
    switch (provider) {
        case "groq":
            return generateWithGroq(systemPrompt, userMessage, modelId);
        case "gemini":
            return generateWithGemini(systemPrompt, userMessage, modelId);
        case "vertex-ai":
            return generateWithVertex(systemPrompt, userMessage, modelId);
        default:
            return null;
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

        if (message && message.length > 200) {
            return NextResponse.json({ error: "Message exceeds 200 characters limit." }, { status: 400 });
        }

        const { data: userData, error: userError } = await fetchUserData(username);

        if (userError || !userData) {
            return NextResponse.json({ error: userError || "User not found" }, { status: 404 });
        }

        const chatbotConfig = await getChatbotConfig(supabaseAdmin);

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

###details about this platform
- **Platform Name**: PortfolioHub
- **Platform Description**: PortfolioHub is a platform for creating and managing personal portfolios.
- **Platform Version**: 2.3.0
- **Platform Author**: Prattay Roy Chowdhury(${process.env.NEXT_PUBLIC_APP_URL}/Prattay)

`;

        let answer = "";

        async function generateTextWithFallback(userMessage: string) {
            const providers = providerFallbackOrder(chatbotConfig.provider);

            for (const provider of providers) {
                const models =
                    provider === chatbotConfig.provider
                        ? modelFallbackOrder(provider, chatbotConfig.model)
                        : modelFallbackOrder(provider, "");

                for (const modelId of models) {
                    try {
                        console.log(`Trying ${provider} model: ${modelId}`);
                        const content = await generateForProvider(
                            provider,
                            systemPrompt,
                            userMessage,
                            modelId
                        );
                        if (content) return content;
                    } catch (err) {
                        console.warn(`${provider} model ${modelId} failed:`, err);
                        continue;
                    }
                }
            }

            throw new Error("All models failed to generate a response.");
        }

        if (audio) {
            // Audio: Gemini native first, then Groq Whisper + text fallback (Vertex is text-only here)
            let audioProcessed = false;

            for (const modelId of GEMINI_MODELS) {
                try {
                    console.log(`Trying Gemini Audio model: ${modelId}`);
                    const model = genAI.getGenerativeModel({
                        model: modelId,
                        systemInstruction: systemPrompt
                    });

                    const result = await model.generateContent([
                        { inlineData: { data: audio, mimeType: "audio/webm" } },
                        { text: "Listen to the audio and answer the user's question." }
                    ]);

                    answer = result.response.text();
                    if (answer) {
                        audioProcessed = true;
                        break;
                    }
                } catch (geminiError) {
                    console.warn(`Gemini Audio model ${modelId} failed:`, geminiError);
                    continue;
                }
            }

            if (!audioProcessed) {
                console.log("Switching to Groq Whisper fallback...");
                try {
                    const audioBuffer = Buffer.from(audio, "base64");
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

                    answer = await generateTextWithFallback(transcribedText);
                } catch (groqError) {
                    console.error("Groq Whisper fallback failed:", groqError);
                    throw new Error("Failed to process audio.");
                }
            }
        } else if (message) {
            answer = await generateTextWithFallback(message);
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
