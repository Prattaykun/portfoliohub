"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";
import { supabase } from "@/lib/supabaseClient";
import debounce from 'lodash/debounce';
import { SoftSkill, TechnicalSkill, SkillsData } from "@/util/types";

export default function SkillsForm() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkill[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [existingSkillsId, setExistingSkillsId] = useState<string | null>(null);

  // Search states
  const [softSkillsSearchResults, setSoftSkillsSearchResults] = useState<SoftSkill[]>([]);
  const [activeSoftSearch, setActiveSoftSearch] = useState(false);
  // Remove the global technical search states
  // const [technicalSkillsSearchResults, setTechnicalSkillsSearchResults] = useState<TechnicalSkill[]>([]);
  // const [activeTechnicalSearch, setActiveTechnicalSearch] = useState(false);

  const questions = [
    { key: "soft", title: "💬 What are your soft skills?", type: "soft" },
    { key: "technical", title: "🛠️ What are your technical skills?", type: "technical" },
  ];

  const current = questions[step];
  const isLast = step === questions.length - 1;

  // Example soft skills
  const softSkillExamples = [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Leadership",
    "Time Management",
    "Adaptability",
    "Creativity",
    "Critical Thinking",
    "Emotional Intelligence",
    "Collaboration"
  ];

  // Example technical skills
  const technicalSkillExamples = [
    { name: "JavaScript", category: "Programming Language", logo_url: "" },
    { name: "React", category: "Frontend Framework", logo_url: "" },
    { name: "Node.js", category: "Backend Runtime", logo_url: "" },
    { name: "Python", category: "Programming Language", logo_url: "" },
    { name: "TypeScript", category: "Programming Language", logo_url: "" },
    { name: "PostgreSQL", category: "Database", logo_url: "" },
    { name: "AWS", category: "Cloud Platform", logo_url: "" },
    { name: "Docker", category: "DevOps", logo_url: "" },
    { name: "Git", category: "Version Control", logo_url: "" },
    { name: "REST APIs", category: "Backend", logo_url: "" }
  ];

  // Fetch existing skills data
  const fetchExistingSkills = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setExistingSkillsId(data.id);
        // Pre-populate soft skills
        if (data.soft && Array.isArray(data.soft)) {
          setSoftSkills(data.soft);
        }
        // Pre-populate technical skills
        if (data.technical && Array.isArray(data.technical)) {
          // Add unique IDs to existing technical skills for proper management
          const technicalSkillsWithIds = data.technical.map((skill: any) => ({
            ...skill,
            id: skill.id || Math.random().toString(36).slice(2)
          }));
          setTechnicalSkills(technicalSkillsWithIds);
        }
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExistingSkills();
  }, [fetchExistingSkills]);

  // Debounced search functions
  const searchSoftSkills = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSoftSkillsSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("soft_skills")
          .select("name, category")
          .ilike("name", `%${query}%`)
          .limit(10);

        if (error) throw error;
        setSoftSkillsSearchResults(data || []);
        setActiveSoftSearch(true);
      } catch (error) {
        console.error("Error searching soft skills:", error);
        setSoftSkillsSearchResults([]);
      }
    }, 500),
    []
  );

  // Create individual search functions for each technical skill
  const searchTechnicalSkills = useCallback(
    debounce(async (query: string, skillId: string) => {
      if (!query || query.length < 2) {
        // Clear search results for this specific skill
        setTechnicalSkills(prev => prev.map(skill => 
          skill.id === skillId 
            ? { ...skill, searchResults: [], activeSearch: false }
            : skill
        ));
        return;
      }

      try {
        const { data, error } = await supabase
          .from("technical_skills")
          .select("name, category, logo_url")
          .ilike("name", `%${query}%`)
          .limit(10);

        if (error) throw error;
        const results = (data || []).map((d: any) => ({
          id: d.id ?? Math.random().toString(36).slice(2),
          name: d.name,
          category: d.category,
          logo_url: d.logo_url,
        })) as TechnicalSkill[];

        // Update only the specific skill with search results
        setTechnicalSkills(prev => prev.map(skill => 
          skill.id === skillId 
            ? { ...skill, searchResults: results, activeSearch: true }
            : skill
        ));
      } catch (error) {
        console.error("Error searching technical skills:", error);
        setTechnicalSkills(prev => prev.map(skill => 
          skill.id === skillId 
            ? { ...skill, searchResults: [], activeSearch: false }
            : skill
        ));
      }
    }, 500),
    []
  );

  // Helper for technical skills
  const makeTechnicalSkill = (seed?: any) => ({
    id: Math.random().toString(36).slice(2),
    name: seed?.name ?? "",
    category: seed?.category ?? "",
    logo_url: seed?.logo_url ?? "",
    searchResults: [] as TechnicalSkill[], // Add individual search results
    activeSearch: false, // Add individual active search state
  });

  const addTechnicalSkill = (seed?: any) => setTechnicalSkills((s) => [...s, makeTechnicalSkill(seed)]);
  
  const updateTechnicalSkill = (id: string, patch: any) =>
    setTechnicalSkills((s) => s.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)));
  
  const removeTechnicalSkill = (id: string) => setTechnicalSkills((s) => s.filter((skill) => skill.id !== id));

  // Helper to clear search for a specific technical skill
  const clearTechnicalSkillSearch = (skillId: string) => {
    setTechnicalSkills(prev => prev.map(skill => 
      skill.id === skillId 
        ? { ...skill, searchResults: [], activeSearch: false }
        : skill
    ));
  };

  const addSoftSkill = (skill: string) => {
    if (!skill || softSkills.includes(skill)) return;
    setSoftSkills((prev) => [...prev, skill]);
    setInput("");
    setActiveSoftSearch(false);
  };

  const removeSoftSkill = (skill: string) => {
    setSoftSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleNext = async () => {
    if (current.type === "technical" && technicalSkills.length === 0) {
      // add a default row if none
      addTechnicalSkill();
      return;
    }

    if (isLast) await handleSubmit();
    else setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Remove search-related fields before saving
      const technicalSkillsForSave = technicalSkills.map(({ searchResults, activeSearch, ...skill }) => skill);

      const payload = {
        auth_user_id: user.id,
        soft: softSkills.length ? softSkills : null,
        technical: technicalSkillsForSave.length ? technicalSkillsForSave : null,
      };

      // 🔍 Check if a row already exists for this user
      const { data: existing, error: fetchError } = await supabase
        .from("skills")
        .select("auth_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      let error;
      if (existing) {
        // ✅ Update existing record
        const { error: updateError } = await supabase
          .from("skills")
          .update({
            soft: payload.soft,
            technical: payload.technical,
          })
          .eq("auth_user_id", user.id);

        error = updateError;
      } else {
        // ✅ Insert new record
        const { error: insertError } = await supabase.from("skills").insert(payload);
        error = insertError;
      }

      if (error) throw error;

      // ✅ Refresh state
      setDone(true);
      await fetchExistingSkills();
    } catch (err) {
      console.error("Error saving skills:", err);
      alert("Failed to save skills — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
        <div className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="text-xl">Loading your skills...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
      <motion.div
        key={current.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        {!done ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                {current.title}
              </h1>
              {existingSkillsId && (
                <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                  Editing Existing Skills
                </span>
              )}
            </div>

            <div className="text-sm text-zinc-300 text-center mb-6">
              {existingSkillsId ? "Update your skills below" : "Add your skills to get started"}
            </div>

            {current.type === "soft" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {softSkills.map((skill) => (
                    <motion.span
                      key={skill}
                      className="px-4 py-2 bg-white/12 rounded-full flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      {skill}
                      <button
                        onClick={() => removeSoftSkill(skill)}
                        className="text-xs opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </motion.span>
                  ))}
                </div>

                <div className="w-full relative">
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      searchSoftSkills(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addSoftSkill(input)}
                    placeholder="Search and add soft skills (e.g. Communication)"
                    className="w-full text-center px-4 py-3 rounded-full bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  
                  {activeSoftSearch && softSkillsSearchResults.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {softSkillsSearchResults.map((skill, index) => (
                        <button
                          key={index}
                          className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                          onClick={() => addSoftSkill(skill.name)}
                        >
                          <div className="font-medium">{skill.name}</div>
                          {skill.category && (
                            <div className="text-xs text-gray-400">{skill.category}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-xs text-zinc-300">Tap to add an example:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {softSkillExamples.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSoftSkill(skill)}
                      className="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current.type === "technical" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    {existingSkillsId ? "Update your technical skills" : "Add your technical skills"} — tap examples to autofill
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addTechnicalSkill()} className="text-sm underline hover:text-blue-300">
                      + Add Skill
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {technicalSkillExamples.map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => addTechnicalSkill(skill)}
                      className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/15 transition"
                    >
                      {skill.name} • {skill.category}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3">
                  {technicalSkills.map((skill) => (
                    <motion.div 
                      key={skill.id} 
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="p-4 bg-white/6 rounded-xl border border-white/8"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {skill.logo_url && (
                            <img src={skill.logo_url} alt="Logo" className="w-6 h-6 rounded" />
                          )}
                          <strong className="text-sm">{skill.name || "New Skill"}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => removeTechnicalSkill(skill.id)} 
                            className="text-xs text-red-300 hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Skill Name with Search */}
                        <div className="relative">
                          <input 
                            value={skill.name} 
                            onChange={(ev) => {
                              updateTechnicalSkill(skill.id, { name: ev.target.value });
                              searchTechnicalSkills(ev.target.value, skill.id);
                            }}
                            onBlur={() => {
                              // Small delay to allow click on search results
                              setTimeout(() => clearTechnicalSkillSearch(skill.id), 200);
                            }}
                            placeholder="Skill name (e.g. React, Python)"
                            className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          {skill.activeSearch && skill.searchResults && skill.searchResults.length > 0 && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {skill.searchResults.map((techSkill: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; category: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; logo_url: string | Blob | undefined; }, index: React.Key | null | undefined) => (
                                <button
                                  key={index}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                                  onClick={() => {
                                    updateTechnicalSkill(skill.id, { 
                                      name: techSkill.name,
                                      category: techSkill.category,
                                      logo_url: techSkill.logo_url 
                                    });
                                    clearTechnicalSkillSearch(skill.id);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {techSkill.logo_url && (
                                      <img src={techSkill.logo_url} alt="Logo" className="w-4 h-4 rounded" />
                                    )}
                                    <div>
                                      <div className="font-medium">{techSkill.name}</div>
                                      <div className="text-xs text-gray-400">{techSkill.category}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Category */}
                        <input 
                          value={skill.category} 
                          onChange={(ev) => updateTechnicalSkill(skill.id, { category: ev.target.value })}
                          placeholder="Category (e.g. Frontend, Database)"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                        />

                        {/* Logo URL and Upload */}
                        <div className="col-span-full flex gap-2 items-center">
                          <input 
                            value={skill.logo_url} 
                            onChange={(ev) => updateTechnicalSkill(skill.id, { logo_url: ev.target.value })}
                            placeholder="Logo URL (optional)"
                            className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          <div className="flex gap-2 items-center">
                            {skill.logo_url && (
                              <img src={skill.logo_url} alt="Logo" className="w-6 h-6 rounded" />
                            )}
                            <CldUploadWidget
                              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                              options={{ multiple: false, folder: "skill_logos" }}
                              onSuccess={(res: any) => {
                                if (res?.info?.secure_url) updateTechnicalSkill(skill.id, { logo_url: res.info.secure_url });
                              }}
                            >
                              {({ open }) => (
                                <button 
                                  type="button" 
                                  onClick={() => open()} 
                                  className="px-3 py-2 rounded-full bg-white/10 text-sm whitespace-nowrap hover:bg-white/15 transition"
                                >
                                  {skill.logo_url ? "Change Logo" : "Upload Logo"}
                                </button>
                              )}
                            </CldUploadWidget>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button onClick={handleBack} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => { setStep(questions.length - 1); }} 
                  className="px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 transition"
                >
                  Jump to End
                </button>
                <button 
                  onClick={handleNext} 
                  disabled={saving}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {saving ? "Saving..." : isLast ? (existingSkillsId ? "Update Skills ✅" : "Finish 🎉") : "Next →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div className="text-center py-10 text-2xl font-semibold text-white-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
              <div>Awesome! Your Skills section is {existingSkillsId ? 'updated' : 'ready'} 🚀</div>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard" className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform">
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => {
                    setDone(false);
                    fetchExistingSkills();
                  }} 
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  Edit Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}