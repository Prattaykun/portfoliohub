"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";
import { supabase } from "@/lib/supabaseClient";
import debounce from "lodash/debounce";
import { SoftSkill, TechnicalSkill } from "@/util/types";

/** ───────────────────────── Types ───────────────────────── */
type CertMedia = {
  url: string;
  public_id?: string;
  resource_type?: "image" | "raw" | "video" | "auto";
  format?: string;
};

type CertSkill = {
  name: string;
  logo_url: string | null;
  category: string | null;
  source: "soft" | "technical";
};

type Certificate = {
  id: string;                // local UI id
  name: string;
  organization: string;
  issue_date: string;        // ISO yyyy-mm-dd
  credential_id?: string;
  credential_url?: string;
  skills: CertSkill[];
  media: CertMedia[];

  // UI-only fields
  skillInput?: string;
  searchResults?: CertSkill[];
  activeSearch?: boolean;
};

export default function SkillsForm() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const [existingSkillsId, setExistingSkillsId] = useState<string | null>(null);

  // Search states (soft skills step)
  const [softSkillsSearchResults, setSoftSkillsSearchResults] = useState<SoftSkill[]>([]);
  const [activeSoftSearch, setActiveSoftSearch] = useState(false);

  const questions = [
    { key: "soft", title: "💬 What are your soft skills?", type: "soft" as const },
    { key: "technical", title: "🛠️ What are your technical skills?", type: "technical" as const },
    { key: "certificates", title: "📜 Add your certifications", type: "certificates" as const },
  ];

  const current = questions[step];
  const isLast = step === questions.length - 1;

  const softSkillExamples = [
    "Communication","Teamwork","Problem Solving","Leadership","Time Management",
    "Adaptability","Creativity","Critical Thinking","Emotional Intelligence","Collaboration",
  ];

  const technicalSkillExamples = [
    { name: "JavaScript", category: "Programming Language", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" },
    { name: "React", category: "Frontend Framework", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" },
    { name: "Node.js", category: "Backend Runtime", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" },
    { name: "Python", category: "Programming Language", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" },
    { name: "TypeScript", category: "Programming Language", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" },
    { name: "PostgreSQL", category: "Database", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" },
    { name: "AWS", category: "Cloud Platform", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original.svg" },
    { name: "Docker", category: "DevOps", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" },
    { name: "Git", category: "Version Control", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" },
    { name: "REST APIs", category: "Backend", logo_url: null },
  ];

  /** ───────────────────── Fetch existing ───────────────────── */
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

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setExistingSkillsId(data.auth_user_id);

        if (data.soft && Array.isArray(data.soft)) {
          setSoftSkills(data.soft);
        }

        if (data.technical && Array.isArray(data.technical)) {
          const technicalSkillsWithIds = data.technical.map((skill: any) => ({
            ...skill,
            id: skill.id || Math.random().toString(36).slice(2),
            searchResults: [],
            activeSearch: false,
          }));
          setTechnicalSkills(technicalSkillsWithIds);
        }

        if (data.certificates && Array.isArray(data.certificates)) {
          const certs = data.certificates.map((c: any) => ({
            id: Math.random().toString(36).slice(2),
            name: c.name ?? "",
            organization: c.organization ?? "",
            issue_date: c.issue_date ?? "",
            credential_id: c.credential_id ?? "",
            credential_url: c.credential_url ?? "",
            // migrate old string arrays to objects on load
            skills: Array.isArray(c.skills)
              ? c.skills.map((s: any) =>
                  typeof s === "string"
                    ? ({ name: s, logo_url: null, category: null, source: "technical" } as CertSkill)
                    : ({
                        name: s.name ?? "",
                        logo_url: s.logo_url ?? null,
                        category: s.category ?? null,
                        source: (s.source === "soft" ? "soft" : "technical") as "soft" | "technical",
                      } as CertSkill)
                )
              : [],
            media: Array.isArray(c.media) ? c.media : [],
            skillInput: "",
            searchResults: [],
            activeSearch: false,
          })) as Certificate[];
          setCertificates(certs);
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

  /** ───────────────────── Debounced searches ───────────────────── */
  const searchSoftSkills = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSoftSkillsSearchResults([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("soft_skills")
          .select("name, category, logo_url")
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

  const searchTechnicalSkills = useCallback(
    debounce(async (query: string, skillId: string) => {
      if (!query || query.length < 2) {
        setTechnicalSkills(prev =>
          prev.map(skill => (skill.id === skillId ? { ...skill, searchResults: [], activeSearch: false } : skill))
        );
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
        setTechnicalSkills(prev =>
          prev.map(skill => (skill.id === skillId ? { ...skill, searchResults: results, activeSearch: true } : skill))
        );
      } catch (error) {
        console.error("Error searching technical skills:", error);
        setTechnicalSkills(prev =>
          prev.map(skill => (skill.id === skillId ? { ...skill, searchResults: [], activeSearch: false } : skill))
        );
      }
    }, 500),
    []
  );

  /** ── Certificates: unified skill search across both tables ── */
  const searchCertSkills = useCallback(
    debounce(async (query: string, certId: string) => {
      if (!query || query.length < 2) {
        setCertificates(prev =>
          prev.map(c => (c.id === certId ? { ...c, searchResults: [], activeSearch: false } : c))
        );
        return;
      }
      try {
        const [soft, tech] = await Promise.all([
          supabase
            .from("soft_skills")
            .select("name, category, logo_url")
            .ilike("name", `%${query}%`)
            .limit(6),
          supabase
            .from("technical_skills")
            .select("name, category, logo_url")
            .ilike("name", `%${query}%`)
            .limit(6),
        ]);

        if (soft.error) throw soft.error;
        if (tech.error) throw tech.error;

        const softResults: CertSkill[] = (soft.data || []).map((s: any) => ({
          name: s.name,
          logo_url: s.logo_url ?? null,
          category: s.category ?? null,
          source: "soft",
        }));

        const techResults: CertSkill[] = (tech.data || []).map((t: any) => ({
          name: t.name,
          logo_url: t.logo_url ?? null,
          category: t.category ?? null,
          source: "technical",
        }));

        // merge with soft first, then technical
        const merged: CertSkill[] = [...softResults, ...techResults];

        setCertificates(prev =>
          prev.map(c =>
            c.id === certId ? { ...c, searchResults: merged, activeSearch: true } : c
          )
        );
      } catch (error) {
        console.error("Error searching certificate skills:", error);
        setCertificates(prev =>
          prev.map(c => (c.id === certId ? { ...c, searchResults: [], activeSearch: false } : c))
        );
      }
    }, 500),
    []
  );

  /** ───────────────────── Helpers: technical ───────────────────── */
  const makeTechnicalSkill = (seed?: any) => ({
    id: Math.random().toString(36).slice(2),
    name: seed?.name ?? "",
    category: seed?.category ?? "",
    logo_url: seed?.logo_url ?? "",
    searchResults: [] as TechnicalSkill[],
    activeSearch: false,
  });
  const addTechnicalSkill = (seed?: any) => setTechnicalSkills(s => [...s, makeTechnicalSkill(seed)]);
  const updateTechnicalSkill = (id: string, patch: any) =>
    setTechnicalSkills(s => s.map(skill => (skill.id === id ? { ...skill, ...patch } : skill)));
  const removeTechnicalSkill = (id: string) =>
    setTechnicalSkills(s => s.filter(skill => skill.id !== id));
  const clearTechnicalSkillSearch = (skillId: string) => {
    setTechnicalSkills(prev =>
      prev.map(skill => (skill.id === skillId ? { ...skill, searchResults: [], activeSearch: false } : skill))
    );
  };

  /** ───────────────────── Helpers: soft ───────────────────── */
  const addSoftSkill = (skill: string) => {
    if (!skill || softSkills.includes(skill)) return;
    setSoftSkills(prev => [...prev, skill]);
    setInput("");
    setActiveSoftSearch(false);
  };
  const removeSoftSkill = (skill: string) => {
    setSoftSkills(prev => prev.filter(s => s !== skill));
  };

  /** ───────────────────── Helpers: certificates ───────────────────── */
  const makeCertificate = (seed?: Partial<Certificate>): Certificate => ({
    id: Math.random().toString(36).slice(2),
    name: seed?.name ?? "",
    organization: seed?.organization ?? "",
    issue_date: seed?.issue_date ?? "",
    credential_id: seed?.credential_id ?? "",
    credential_url: seed?.credential_url ?? "",
    skills: seed?.skills ?? [],
    media: seed?.media ?? [],
    skillInput: "",
    searchResults: [],
    activeSearch: false,
  });

  const addCertificate = (seed?: Partial<Certificate>) =>
    setCertificates(prev => [...prev, makeCertificate(seed)]);

  const updateCertificate = (id: string, patch: Partial<Certificate>) =>
    setCertificates(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));

  const removeCertificate = (id: string) =>
    setCertificates(prev => prev.filter(c => c.id !== id));

  const addSkillToCertificate = (id: string, skill: CertSkill) =>
    setCertificates(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              skills: c.skills.some(s => s.name === skill.name && s.source === skill.source)
                ? c.skills
                : [...c.skills, skill],
              skillInput: "",
              activeSearch: false,
              searchResults: [],
            }
          : c
      )
    );

  const removeSkillFromCertificate = (id: string, skillIndex: number) =>
    setCertificates(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, skills: c.skills.filter((_, i) => i !== skillIndex) }
          : c
      )
    );

  /** ───────────────────── Navigation ───────────────────── */
  const handleNext = async () => {
    if (current.type === "technical" && technicalSkills.length === 0) {
      addTechnicalSkill();
      return;
    }
    if (isLast) await handleSubmit();
    else setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  /** ───────────────────── Submit ───────────────────── */
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // strip UI-only fields
      const technicalSkillsForSave = technicalSkills.map(({ searchResults, activeSearch, ...skill }) => skill);
      const certificatesForSave = certificates.map(
        ({ id, searchResults, activeSearch, skillInput, ...c }) => c
      );

      const payload = {
        auth_user_id: user.id,
        soft: softSkills.length ? softSkills : null,
        technical: technicalSkillsForSave.length ? technicalSkillsForSave : null,
        certificates: certificatesForSave, // keep [] if empty
      };

      const { data: existing, error: fetchError } = await supabase
        .from("skills")
        .select("auth_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from("skills")
          .update({
            soft: payload.soft,
            technical: payload.technical,
            certificates: payload.certificates,
          })
          .eq("auth_user_id", user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("skills").insert(payload);
        error = insertError;
      }
      if (error) throw error;

      setDone(true);
      await fetchExistingSkills();
    } catch (err) {
      console.error("Error saving skills:", err);
      alert("Failed to save skills — please try again.");
    } finally {
      setSaving(false);
    }
  };

  /** ───────────────────── UI ───────────────────── */
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
    <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
      <motion.div
        key={current.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-4 md:p-8 border border-white/10 shadow-2xl"
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
              {existingSkillsId ? "Update your details below" : "Add your details to get started"}
            </div>

            {/* ─────────── Soft Skills ─────────── */}
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
                        className="text-xs opacity-80 hover:opacity-100 cursor-pointer"
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
                      className="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20 cursor-pointer active:scale-95 transition-transform"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────── Technical Skills ─────────── */}
            {current.type === "technical" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    {existingSkillsId ? "Update your technical skills" : "Add your technical skills"} — tap examples to autofill
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addTechnicalSkill()} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm transition-all active:scale-95 cursor-pointer">+ Add Skill</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {technicalSkillExamples.map((skill, i) => (
                    <button
                      key={i}
                      onClick={() => addTechnicalSkill(skill)}
                      className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/15 cursor-pointer active:scale-95 transition-transform"
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
                          {skill.logo_url && <img src={skill.logo_url} alt="Logo" className="w-6 h-6 rounded" />}
                          <strong className="text-sm">{skill.name || "New Skill"}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => removeTechnicalSkill(skill.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition-all active:scale-95 cursor-pointer">Remove</button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Skill Name + Search */}
                        <div className="relative">
                          <input
                            value={skill.name}
                            onChange={(ev) => {
                              updateTechnicalSkill(skill.id, { name: ev.target.value });
                              searchTechnicalSkills(ev.target.value, skill.id);
                            }}
                            onBlur={() => setTimeout(() => clearTechnicalSkillSearch(skill.id), 200)}
                            placeholder="Skill name (e.g. React, Python)"
                            className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                          {skill.activeSearch && skill.searchResults && skill.searchResults.length > 0 && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {skill.searchResults.map((techSkill: any, index: number) => (
                                <button
                                  key={index}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                                  onClick={() => {
                                    updateTechnicalSkill(skill.id, {
                                      name: techSkill.name,
                                      category: techSkill.category,
                                      logo_url: techSkill.logo_url,
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

                        {/* Logo URL + Upload */}
                        <div className="col-span-full flex flex-col md:flex-row gap-2 md:items-center">
                          <input
                            value={skill.logo_url}
                            onChange={(ev) => updateTechnicalSkill(skill.id, { logo_url: ev.target.value })}
                            placeholder="Logo URL (optional)"
                            className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none w-full"
                          />
                          <div className="flex gap-2 items-center">
                            {skill.logo_url && <img src={skill.logo_url} alt="Logo" className="w-6 h-6 rounded" />}
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
                                  className="px-3 py-2 rounded-full bg-white/10 text-sm whitespace-nowrap hover:bg-white/15 cursor-pointer active:scale-95 transition-transform"
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

            {/* ─────────── Certificates ─────────── */}
            {current.type === "certificates" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    Add certifications. Attach images/PDFs, tag related skills, and include verification links.
                  </div>
                  <button onClick={() => addCertificate()} className="text-sm underline cursor-pointer hover:text-blue-300 transition">
                    + Add Certificate
                  </button>
                </div>

                {certificates.length === 0 && (
                  <div className="text-sm text-zinc-300">
                    No certificates yet. Click <span className="underline cursor-pointer" onClick={() => addCertificate()}>+ Add Certificate</span> to start.
                  </div>
                )}

                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/6 rounded-xl border border-white/8"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <strong className="text-sm">{cert.name || "New Certificate"}</strong>
                          <span className="text-xs text-zinc-300">{cert.organization}</span>
                        </div>
                        <button onClick={() => removeCertificate(cert.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition-all active:scale-95 cursor-pointer">Remove</button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={cert.name}
                          onChange={(e) => updateCertificate(cert.id, { name: e.target.value })}
                          placeholder="Certificate name (e.g. AWS Certified Developer – Associate)"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        <input
                          value={cert.organization}
                          onChange={(e) => updateCertificate(cert.id, { organization: e.target.value })}
                          placeholder="Issuing organization (e.g. Amazon Web Services)"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        <input
                          type="date"
                          value={cert.issue_date}
                          onChange={(e) => updateCertificate(cert.id, { issue_date: e.target.value })}
                          placeholder="Issue date"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        <input
                          value={cert.credential_id ?? ""}
                          onChange={(e) => updateCertificate(cert.id, { credential_id: e.target.value })}
                          placeholder="Credential ID (optional)"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        <input
                          value={cert.credential_url ?? ""}
                          onChange={(e) => updateCertificate(cert.id, { credential_url: e.target.value })}
                          placeholder="Credential URL (verification link)"
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                        />

                        {/* Media upload */}
                        <div className="col-span-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-zinc-300">Attachments (images or PDFs):</div>
                            <CldUploadWidget
                              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                              options={{ multiple: true, folder: "certificates", resourceType: "auto" } as any}
                              onSuccess={(res: any) => {
                                const infos = Array.isArray(res) ? res.map(r => r.info) : [res?.info];
                                const mediaToAdd: CertMedia[] = (infos || [])
                                  .filter(Boolean)
                                  .map((info: any) => ({
                                    url: info.secure_url,
                                    public_id: info.public_id,
                                    resource_type: info.resource_type,
                                    format: info.format,
                                  }));
                                updateCertificate(cert.id, { media: [...(cert.media || []), ...mediaToAdd] });
                              }}
                            >
                              {({ open }) => (
                                <button
                                  type="button"
                                  onClick={() => open()}
                                  className="px-3 py-2 rounded-full bg-white/10 text-sm whitespace-nowrap hover:bg-white/15 cursor-pointer active:scale-95 transition-transform"
                                >
                                  Upload Files
                                </button>
                              )}
                            </CldUploadWidget>
                          </div>

                          {/* Preview */}
                          {cert.media?.length ? (
                            <div className="flex flex-wrap gap-3">
                              {cert.media.map((m, idx) => (
                                <div key={idx} className="bg-white/8 rounded-lg p-2 border border-white/10">
                                  {m.resource_type === "image" ? (
                                    <img src={m.url} alt="certificate media" className="w-24 h-24 object-cover rounded" />
                                  ) : (
                                    <a href={m.url} target="_blank" rel="noreferrer" className="underline text-sm">
                                      {m.format?.toUpperCase() || "FILE"}
                                    </a>
                                  )}
                                  <div className="mt-1 text-right">
                                    <button
                                      className="text-xs text-red-300 hover:text-red-400 cursor-pointer"
                                      onClick={() =>
                                        updateCertificate(cert.id, {
                                          media: cert.media.filter((_, i) => i !== idx),
                                        })
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-zinc-400">No files uploaded yet.</div>
                          )}
                        </div>

                        {/* Skills for this certificate (searches both tables) */}
                        <div className="col-span-full">
                          <div className="text-sm text-zinc-300 mb-1">Related skills:</div>

                          {/* Selected */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {cert.skills.map((s, idx) => (
                              <span key={`${s.source}-${s.name}-${idx}`} className="px-3 py-1 bg-white/12 rounded-full text-sm flex items-center gap-2">
                                {s.logo_url && <img src={s.logo_url} alt="" className="w-4 h-4 rounded" />}
                                <span>{s.name}</span>
                                <span className="text-[10px] opacity-70 px-1 py-0.5 rounded bg-white/10">{s.source}</span>
                                <button
                                  className="text-xs opacity-80 hover:opacity-100 cursor-pointer"
                                  onClick={() => removeSkillFromCertificate(cert.id, idx)}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>

                          {/* Search input + dropdown */}
                          <div className="relative">
                            <input
                              value={cert.skillInput ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateCertificate(cert.id, { skillInput: v });
                                searchCertSkills(v, cert.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && cert.searchResults && cert.searchResults[0]) {
                                  addSkillToCertificate(cert.id, cert.searchResults[0]);
                                }
                              }}
                              placeholder="Search skills by name (searches soft + technical)"
                              className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            {cert.activeSearch && (cert.searchResults?.length ?? 0) > 0 && (
                              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {cert.searchResults!.map((skill, i) => (
                                  <button
                                    key={`${skill.source}-${skill.name}-${i}`}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                                    onClick={() => addSkillToCertificate(cert.id, skill)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {skill.logo_url && (
                                        <img src={skill.logo_url} alt="Logo" className="w-4 h-4 rounded" />
                                      )}
                                      <div className="flex flex-col">
                                        <div className="font-medium">{skill.name}</div>
                                        <div className="text-xs text-gray-400">
                                          {skill.category ?? "—"} • {skill.source}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ─────────── Footer nav ─────────── */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button onClick={handleBack} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95 transition-transform">
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(questions.length - 1)}
                  className="px-4 py-2 rounded-full bg-white/6 hover:bg-white/10 cursor-pointer active:scale-95 transition-transform"
                >
                  Jump to End
                </button>
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {saving ? "Saving..." : isLast ? (existingSkillsId ? "Update ✅" : "Finish 🎉") : "Next →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div className="text-center py-10 text-2xl font-semibold text-white-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
              <div>Awesome! Your profile is {existingSkillsId ? "updated" : "ready"} 🚀</div>
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
