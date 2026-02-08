"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Send, StopCircle, Bot, Loader2, ArrowLeft, Share2 } from "lucide-react";

import { createClient } from "@supabase/supabase-js";
import ChatMessage from "@/components/ChatMessage";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  role: "user" | "model";
  content: string;
  type?: "text" | "audio";
}

interface UserProfile {
  full_name: string;
  photo_url: string;
  roles: string[];
}


// ... (imports remain)

export default function ChatbotPage() {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for textarea
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track Supabase auth session (logged-in vs logged-out)
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setIsLoggedIn(!!data.session);
    };

    initSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setIsLoggedIn(!!session);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Fetch User Profile for Sidebar (Same as before)
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase
        .from("users_usernames")
        .select("auth_user_id")
        .ilike("username", username)
        .single();

      if (userData?.auth_user_id) {
        const [profileRes, aboutRes] = await Promise.all([
            supabase.from("user_profiles").select("full_name, photo_url").eq("uid", userData.auth_user_id).single(),
            supabase.from("about").select("roles").eq("auth_user_id", userData.auth_user_id).single()
        ]);

        if (profileRes.data) {
            setUserProfile({
                full_name: profileRes.data.full_name,
                photo_url: profileRes.data.photo_url,
                roles: aboutRes.data?.roles || []
            });
            
            setMessages([
                { role: "model", content: `Hello! I'm the AI agent for **${profileRes.data.full_name}**. \n\nI can answer questions about their work, experience, or specific projects. How can I help you?` }
            ]);
        }
      }
    };
    fetchProfile();
  }, [username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Textarea Auto-Resize
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height
        const scrollHeight = textareaRef.current.scrollHeight;
        // Limit to 4 lines (approx 24px per line + padding ~ 20px -> ~116px max)
        const maxHeight = 120; 
        textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage, type: "text" }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          message: userMessage,
          history: messages,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [...prev, { role: "model", content: data.answer }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Audio recording logic same as before)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await sendAudioMessage(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access needed:", err);
      alert("Microphone access is required for voice chat.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendAudioMessage = async (base64Audio: string) => {
    setMessages((prev) => [...prev, { role: "user", content: "(Audio Message)", type: "audio" }]);
    setIsLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, audio: base64Audio, history: messages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "model", content: data.answer }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "model", content: "Sorry, I encountered an audio processing error." }]);
    } finally {
      setIsLoading(false);
    }
  };



  // Helper for Mobile Menu Actions
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setShowMobileMenu(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}/chatbot`;
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${userProfile?.full_name || "User"}'s AI Agent`,
                text: `Chat with ${userProfile?.full_name || "User"}'s personal AI agent!`,
                url: url
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    }
    setShowMobileMenu(false);
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans">
      
      {/* Sidebar (Desktop) - 25% width */}
      <aside className="w-80 hidden md:flex flex-col border-r border-white/5 bg-[#161b22]">
        <div className="p-6 border-b border-white/5">
            <Link href={`/${username}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Portfolio
            </Link>
            
            {userProfile ? (
                <div className="text-center">
                    <Link href={`/${username}`} className="cursor-pointer block relative mx-auto mb-4 group w-24 h-24">
                        <div className="p-[3px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-green-600 hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 h-full w-full">
                            <div className="p-[3px] rounded-full bg-[#161b22] h-full w-full relative">
                                <img 
                                    src={userProfile.photo_url || "https://via.placeholder.com/150"} 
                                    alt={userProfile.full_name} 
                                    className="w-full h-full rounded-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-[#161b22] rounded-full z-10" title="Agent Online"></div>
                            </div>
                        </div>
                    </Link>
                    <h2 className="text-xl font-bold">{userProfile.full_name}</h2>
                    <p className="text-sm text-gray-400 mt-1">{userProfile.roles[0]}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center animate-pulse">
                     <div className="w-24 h-24 bg-white/10 rounded-full mb-4"></div>
                     <div className="h-4 w-32 bg-white/10 rounded"></div>
                </div>
            )}
        </div>
        
        {/* ... (rest of sidebar content same) ... */}
        <div className="p-6 flex-1 overflow-y-auto">
             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Agent Capabilities</h3>
             <ul className="space-y-3 text-sm text-gray-300 mb-6">
                 <li className="flex items-start gap-2">
                     <Bot size={16} className="text-purple-400 shrink-0 mt-0.5" />
                     <span>Answers questions about experience and skills.</span>
                 </li>
                 <li className="flex items-start gap-2">
                     <Mic size={16} className="text-purple-400 shrink-0 mt-0.5" />
                     <span>Supports voice interaction (Gemini Native Audio).</span>
                 </li>
             </ul>
             
             {/* Share Button (Desktop) */}
             <button 
                onClick={handleShare}
                className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 group cursor-pointer hover:opacity-80"
             >
                <Share2 size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Share PortAI</span>
             </button>
         </div>

      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-gradient-to-br from-[#0f1117] via-[#13161c] to-[#0f1117]">
        
        {/* Mobile Header (Updated) */}
        <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between bg-[#161b22] relative z-20">
             {/* Back Button (Circle) */}
             {/* Back to Portfolio (Profile Photo with Story Outline) */}
             <Link href={`/${username}`} className="relative group">
                 <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-green-600 hover:scale-105 transition-transform">
                     <div className="p-[2px] rounded-full bg-[#161b22]">
                        <img 
                            src={userProfile?.photo_url || "https://via.placeholder.com/150"} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                     </div>
                 </div>
             </Link>
             
             <span className="font-semibold">{userProfile?.full_name || "AI Agent"}</span>
             
             {/* 3-Dot Menu */}
             <div className="relative">
                <button 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                    <div className="flex gap-[3px]">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </button>
                
                {/* Dropdown */}
                {showMobileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1e232e] border border-white/10 rounded-lg shadow-xl backdrop-blur-md py-1 z-30">
                    {!isLoggedIn ? (
                      <Link href="/auth" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white" onClick={() => setShowMobileMenu(false)}>
                        Login
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white" onClick={() => setShowMobileMenu(false)}>
                        Dashboard
                      </Link>
                    )}
                        <button onClick={handleShare} className="block w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/5 flex items-center gap-2">
                            <Share2 size={14} />
                            Share PortAI
                        </button>
                    {isLoggedIn && (
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5">
                        Logout
                      </button>
                    )}
                    </div>
                )}
             </div>
        </div>

        {/* Messages (Same as before) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full px-11">
              <div className="flex items-center space-x-2 text-gray-400 bg-[#1e232e] px-4 py-2 rounded-2xl rounded-tl-none border border-white/5">
                <Loader2 size={16} className="animate-spin text-purple-400" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Updated with auto-resize) */}
        <div className="p-4 md:p-6 bg-[#161b22] border-t border-white/5">
          <div className="max-w-4xl mx-auto relative flex items-end gap-3">
             {/* Audio Button */}
             <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`mb-1 p-3 rounded-full transition-all duration-200 shrink-0 ${
                isRecording 
                  ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse border border-red-500/50" 
                  : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              {isRecording ? <StopCircle size={22} /> : <Mic size={22} />}
            </button>

            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder={isRecording ? "Listening..." : "Ask anything..."}
                    disabled={isRecording || isLoading}
                    rows={1}
                    className="w-full bg-[#0d1117] text-white border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-600 resize-none min-h-[46px] overflow-hidden"
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading || isRecording}
                    className={`absolute right-2 bottom-1.5 p-2 rounded-lg transition-colors ${
                        inputValue.trim() && !isLoading && !isRecording
                        ? "text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                        : "text-gray-600 cursor-not-allowed"
                    }`}
                >
                    <Send size={18} />
                </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            AI can make mistakes. Please check important info.
          </p>
        </div>
      </main>
    </div>
  );
}
