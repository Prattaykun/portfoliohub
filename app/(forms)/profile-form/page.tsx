"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CldUploadWidget } from "next-cloudinary";

export default function ProfileChatForm() {
  const router = useRouter();

  const questions = [
    {
      key: "full_name",
      question: "Hey there 👋 What's your full name?",
      placeholder: "e.g. Alex Carter",
    },
    {
      key: "date_of_birth",
      question: "When's your date of birth?",
      placeholder: "Select your birth date",
      type: "date",
    },
    {
      key: "gender",
      question: "What's your gender?",
      options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      placeholder: "Select or type your own",
    },
    {
      key: "nationality",
      question: "Which country are you from?",
      options: ["India", "USA", "UK", "Canada", "Australia"],
      placeholder: "Start typing your country",
    },
    {
      key: "pronouns",
      question: "What pronouns do you prefer?",
      options: ["He/Him", "She/Her", "They/Them"],
      placeholder: "e.g. He/Him",
    },
    {
      key: "locale",
      question: "Which language or locale do you use?",
      options: ["en-US", "en-GB", "hi-IN", "fr-FR", "de-DE"],
      placeholder: "e.g. en-US",
    },
    {
      key: "photo_url",
      question: "Want to upload a profile picture?",
      type: "image",
    },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const current = questions[step];
  const isLast = step === questions.length - 1;

  // Fetch existing user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("uid", user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error("Error fetching profile:", error);
        }

        if (data) {
          setAnswers(data);
          setIsEditing(true);
          
          // Pre-fill date if exists
          if (data.date_of_birth) {
            const [year, month, day] = data.date_of_birth.split('-').map(Number);
            setSelectedDate(new Date(year, month - 1, day));
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Pre-fill input when step changes and answer exists
  useEffect(() => {
    if (current && answers[current.key] && current.type !== 'date' && current.type !== 'image') {
      setInput(answers[current.key]);
    } else if (current && !answers[current.key]) {
      setInput("");
    }
  }, [current, answers]);

  const handleNext = async (value: string) => {
    if (!value && !answers[current.key]) return;
    
    const key = current.key;
    const updated = { ...answers, [key]: value || answers[current.key] };
    setAnswers(updated);
    setInput("");
    setSelectedDate(null);
    
    if (!isLast) {
      setStep(step + 1);
    } else {
      await handleSubmit(updated);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (finalAnswers: Record<string, string>) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not logged in");

      const { error } = await supabase.from("user_profiles").upsert({
        uid: user.id,
        ...finalAnswers,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile.");
    }
  };

  // Skip to next if current field already has data and user wants to keep it
  const handleSkip = () => {
    if (answers[current.key]) {
      if (!isLast) {
        setStep(step + 1);
      } else {
        handleSubmit(answers);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text">
            {isEditing ? "Update Your Profile" : "Let's Build Your Profile"}
          </h1>
          {isEditing && (
            <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full">
              Editing Mode
            </span>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="text-lg font-medium"
              >
                {current.question}
                {isEditing && answers[current.key] && (
                  <div className="text-sm text-green-300 mt-1">
                    Current: {answers[current.key]}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xl font-semibold text-green-300"
              >
                {isEditing ? "Profile Updated! 🎉" : "Awesome! Profile Created! 🎉"}
                <br />
                <span className="text-sm text-zinc-300">Redirecting to dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <div className="flex flex-col space-y-3">
              {current.type === "image" ? (
                <div className="flex flex-col items-center space-y-3">
                  {answers.photo_url && (
                    <img
                      src={answers.photo_url}
                      alt="Preview"
                      className="w-28 h-28 rounded-full border-2 border-blue-400 shadow-lg object-cover"
                    />
                  )}

                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    options={{
                      cropping: true,
                      croppingAspectRatio: 1,
                      multiple: false,
                      resourceType: "image",
                      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
                      folder: "profile_photos",
                    }}
                    onSuccess={(result: any) => {
                      if (result?.info?.secure_url) {
                        const url = result.info.secure_url;
                        setAnswers((prev) => ({ ...prev, photo_url: url }));
                      }
                    }}
                    onError={(err: any) => {
                      console.error("Cloudinary upload error:", err);
                      alert("Image upload failed. Please try again.");
                    }}
                  >
                    {({ open }) => (
                      <button
                        onClick={() => open()}
                        className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 px-5 py-2 rounded-full font-semibold hover:scale-105 transition-transform"
                      >
                        {answers.photo_url ? "Change Photo" : "Upload Profile Photo"}
                      </button>
                    )}
                  </CldUploadWidget>

                  <div className="flex gap-2">
                    {answers.photo_url && (
                      <button
                        onClick={() => handleNext(answers.photo_url)}
                        className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Keep Current →
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={handleSkip}
                        className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </div>
              ) : current.type === "date" ? (
                <div className="flex flex-col items-center space-y-3">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        const localDate = new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000
                        )
                          .toISOString()
                          .split("T")[0];
                        handleNext(localDate);
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText={answers.date_of_birth || current.placeholder}
                    className="px-4 py-3 w-full rounded-full bg-white/20 border border-white/30 text-white placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center cursor-pointer"
                  />
                  {isEditing && answers.date_of_birth && (
                    <button
                      onClick={handleSkip}
                      className="text-sm text-blue-300 underline hover:text-blue-200"
                    >
                      Keep current date
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {current.options && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {current.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleNext(opt)}
                          className={`bg-white/20 border px-4 py-2 rounded-full hover:bg-white/30 transition text-sm ${
                            answers[current.key] === opt 
                              ? 'border-green-400 bg-green-500/20' 
                              : 'border-white/30'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 rounded-full bg-white/20 border border-white/30 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                      placeholder={answers[current.key] || current.placeholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleNext(input)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNext(input)}
                        className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:scale-105 transition-transform font-semibold"
                      >
                        {isLast ? "Save" : "Next"}
                      </button>
                      {isEditing && answers[current.key] && (
                        <button
                          onClick={handleSkip}
                          className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Back button */}
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="mt-2 text-sm text-zinc-300 underline hover:text-white self-start"
                >
                  ← Back
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {Object.keys(answers).length > 0 && !done && (
        <div className="mt-6 text-xs text-zinc-300 max-w-md">
          <p className="mb-1">🗒️ Your {isEditing ? "current" : "progress"}:</p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            {Object.entries(answers).map(([k, v]) => (
              <li key={k}>
                <span className="capitalize">{k.replaceAll("_", " ")}:</span>{" "}
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}