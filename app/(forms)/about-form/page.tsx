"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { supabase } from "@/lib/supabaseClient";
import debounce from 'lodash/debounce';
import { 
  EducationEntry, 
  ExperienceEntry, 
  SchoolSearchResult, 
  CompanySearchResult,
  CloudinaryUploadResultInfo
} from '@/util/types';

export default function AboutForm() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  // Search states
  const [schoolSearchResults, setSchoolSearchResults] = useState<SchoolSearchResult[]>([]);
  const [companySearchResults, setCompanySearchResults] = useState<CompanySearchResult[]>([]);
  const [activeSchoolSearchId, setActiveSchoolSearchId] = useState<string | null>(null);
  const [activeCompanySearchId, setActiveCompanySearchId] = useState<string | null>(null);

  const questions = [
    { key: "roles", title: "✨ What roles describe you best?", type: "roles" },
    { key: "bio", title: "🧠 Tell us a bit about yourself", type: "bio" },
    { key: "education", title: "🎓 Add your education details", type: "education" },
    { key: "experience", title: "💼 Share your work experiences (optional)", type: "experience" },
  ];

  const current = questions[step];
  const isLast = step === questions.length - 1;

  const years = Array.from({ length: 60 }, (_, i) => (new Date().getFullYear() - i).toString());

  // Fetch existing data on component mount
  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch existing about data
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        // Populate form with existing data
        setRoles(data.roles || []);
        setBio(data.bio || "");
        setEducation(data.education || []);
        setExperience(data.experience || []);
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
      alert("Failed to load existing profile data");
    } finally {
      setLoading(false);
    }
  };

  // Resume-based examples (from attached resume)
  const eduExamples: Partial<EducationEntry>[] = [
    {
      level: "Graduation",
      degree: "B.Tech (Electronics & Communication Engineering)",
      institution: "RCC Institute of Information Technology",
      startYear: "2023",
      endYear: "2027",
      pursuing: true,
      grade: "7.39",
      gradeScale: "10",
    },
    {
      level: "Higher Secondary",
      degree: "Higher Secondary",
      institution: "Belur High School",
      startYear: "2020",
      endYear: "2022",
      grade: "84.6",
      gradeScale: "100",
    },
    {
      level: "Secondary",
      degree: "Secondary",
      institution: "Uttarpara Children's Own Home",
      startYear: "2015",
      endYear: "2020",
      grade: "86.4",
      gradeScale: "100",
    },
  ];

  const expExamples: Partial<ExperienceEntry>[] = [
    {
      title: "Frontend Engineer Intern",
      company: "TechInnovate Solutions",
      companyUrl: "",
      start: "2024-06",
      end: "2024-09",
      present: false,
      skills: ["React", "TypeScript", "Redux", "Jest"],
      description: "Developed and maintained responsive web applications using React and TypeScript, improving user engagement by 25% through optimized UI components.",
    },
    {
      title: "Full Stack Developer",
      company: "DigitalFlow Systems",
      companyUrl: "",
      start: "2024-10",
      end: "",
      present: true,
      skills: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
      description: "Building scalable full-stack applications with Next.js and Node.js, implementing real-time features and optimizing database performance.",
    },
    {
      title: "Software Engineering Intern",
      company: "CloudNexa Technologies",
      companyUrl: "",
      start: "2024-01",
      end: "2024-05",
      skills: ["Python", "Django", "Docker", "REST APIs"],
      description: "Contributed to backend service development using Django, reducing API response times by 40% through query optimization and caching strategies.",
    },
  ];

  // Debounced search functions
  const searchSchools = useCallback(
    debounce(async (query: string, educationId: string): Promise<void> => {
      if (!query || query.length < 2) {
        setSchoolSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("schools")
          .select('"School Name", rank, owner_ship')
          .ilike('"School Name"', `%${query}%`)
          .limit(10);

        if (error) throw error;
        setSchoolSearchResults(data || []);
        setActiveSchoolSearchId(educationId);
      } catch (error) {
        console.error("Error searching schools:", error);
        setSchoolSearchResults([]);
      }
    }, 500),
    []
  );

  const searchCompanies = useCallback(
    debounce(async (query: string, experienceId: string): Promise<void> => {
      if (!query || query.length < 2) {
        setCompanySearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("companies")
          .select('"Company_name", "Description"')
          .or(`"Company_name".ilike.%${query}%, "Description".ilike.%${query}%`)
          .limit(10);

        if (error) throw error;
        setCompanySearchResults(data || []);
        setActiveCompanySearchId(experienceId);
      } catch (error) {
        console.error("Error searching companies:", error);
        setCompanySearchResults([]);
      }
    }, 500),
    []
  );

  // Update favicon when domain changes
  const updateFaviconFromDomain = useCallback((domain: string, id: string, isEducation: boolean): void => {
    if (!domain) return;

    try {
      // Extract domain from URL if full URL is provided
      let cleanDomain = domain;
      if (domain.includes('//')) {
        cleanDomain = new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname;
      }

      const faviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`;

      if (isEducation) {
        updateEducation(id, { logo: faviconUrl, domain: cleanDomain });
      } else {
        updateExperience(id, { logo: faviconUrl });
      }
    } catch (error) {
      console.error("Error generating favicon URL:", error);
    }
  }, []);

  // helpers for education
  const makeEducation = (seed?: Partial<EducationEntry>): EducationEntry => ({
    id: Math.random().toString(36).slice(2),
    level: seed?.level ?? "Graduation",
    degree: seed?.degree ?? "Degree name",
    institution: seed?.institution ?? "Institution name",
    domain: seed?.domain ?? "",
    logo: seed?.logo ?? "",
    startYear: seed?.startYear ?? "",
    endYear: seed?.endYear ?? "",
    pursuing: seed?.pursuing ?? false,
    grade: seed?.grade ?? "",
    gradeScale: seed?.gradeScale ?? "100",
  });

  const addEducation = (seed?: Partial<EducationEntry>): void => setEducation((s) => [...s, makeEducation(seed)]);
  const updateEducation = (id: string, patch: Partial<EducationEntry>): void =>
    setEducation((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEducation = (id: string): void => setEducation((s) => s.filter((e) => e.id !== id));

  // helpers for experience
  const makeExperience = (seed?: Partial<ExperienceEntry>): ExperienceEntry => ({
    id: Math.random().toString(36).slice(2),
    title: seed?.title ?? "Role title",
    company: seed?.company ?? "Company / Project",
    companyUrl: seed?.companyUrl ?? "",
    start: seed?.start ?? "",
    end: seed?.end ?? "",
    present: seed?.present ?? false,
    skills: seed?.skills ?? [],
    logo: seed?.logo ?? "",
    offerLetter: seed?.offerLetter ?? "",
    description: seed?.description ?? "",
  });

  const addExperience = (seed?: Partial<ExperienceEntry>): void => setExperience((s) => [...s, makeExperience(seed)]);
  const updateExperience = (id: string, patch: Partial<ExperienceEntry>): void =>
    setExperience((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeExperience = (id: string): void => setExperience((s) => s.filter((e) => e.id !== id));

  const handleNext = async (): Promise<void> => {
    if (current.type === "education" && education.length === 0) {
      // add a default row if none
      addEducation();
      return;
    }

    if (isLast) await handleSubmit();
    else setStep((s) => s + 1);
  };

  const handleBack = (): void => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (): Promise<void> => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const payload = {
        auth_user_id: user.id,
        roles: roles.length ? roles : null,
        bio: bio || null,
        education: education.length ? education : null,
        experience: experience.length ? experience : null,
        updated_at: new Date().toISOString(),
      };

      // Use upsert to either insert or update existing record
      const { error } = await supabase
        .from("about")
        .upsert(payload, { 
          onConflict: 'auth_user_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const roleExamples = [
    "Frontend Engineer",
    "Backend Engineer",
    "Full‑stack Developer",
    "ML Engineer",
    "Cloud Architect",
  ];

  const addRole = (r: string): void => {
    if (!r) return;
    setRoles((prev) => Array.from(new Set([...prev, r])));
    setInput("");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
        <div className="w-full max-w-2xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="text-xl">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-30 items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text">
                {current.title}
              </h1>
              <div className="text-sm text-zinc-300">
                Step {step + 1} of {questions.length}
              </div>
            </div>

            {current.type === "roles" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="text-sm text-zinc-300 mb-2">
                  {roles.length > 0 ? "Your current roles:" : "Add roles that describe you"}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {roles.map((r) => (
                    <motion.span
                      key={r}
                      className="px-4 py-2 bg-white/12 rounded-full flex items-center gap-2 text-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      {r}
                      <button
                        onClick={() => setRoles(roles.filter((x) => x !== r))}
                        className="text-xs opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </motion.span>
                  ))}
                </div>

                <div className="w-full flex gap-2 mt-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addRole(input)}
                    placeholder="Add a role (e.g. Full‑stack Engineer)"
                    className="flex-1 text-center px-4 py-3 rounded-full bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button
                    onClick={() => addRole(input)}
                    className="px-4 py-3 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform"
                  >
                    Add
                  </button>
                </div>

                <div className="text-xs text-zinc-300 mt-2">Tap to add an example:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {roleExamples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => addRole(ex)}
                      className="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current.type === "bio" && (
              <div className="flex flex-col items-center space-y-3">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio about your engineering journey ✨"
                  className="w-full px-4 py-3 rounded-2xl bg-white/8 border border-white/10 text-white min-h-[120px] focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <div className="text-xs text-zinc-300">Need ideas?</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Building scalable systems 🚀", "React + Node wizard ⚡", "Loves clean code 🧹"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setBio(ex)}
                      className="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current.type === "education" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    {education.length > 0 ? "Your education entries" : "Add your education entries"} — tap examples to autofill
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addEducation()} className="text-sm underline hover:text-white transition">+ Add</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {eduExamples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => addEducation(ex)}
                      className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition"
                    >
                      {ex.degree} • {ex.institution}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3">
                  {education.map((e) => (
                    <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/6 rounded-xl border border-white/8">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {e.logo && (
                            <Image src={e.logo} alt="Logo" width={24} height={24} className="w-6 h-6 rounded" />
                          )}
                          <strong className="text-sm">{e.level} — {e.degree}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => removeEducation(e.id)} className="text-xs hover:text-red-300 transition">Remove</button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select 
                          value={e.level} 
                          onChange={(ev) => updateEducation(e.id, { level: ev.target.value })}
                          className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                        >
                          <option className="bg-gray-800 text-white">Secondary</option>
                          <option className="bg-gray-800 text-white">Higher Secondary</option>
                          <option className="bg-gray-800 text-white">Diploma</option>
                          <option className="bg-gray-800 text-white">Graduation</option>
                          <option className="bg-gray-800 text-white">Post Graduation</option>
                          <option className="bg-gray-800 text-white">Other</option>
                        </select>

                        <input value={e.degree} onChange={(ev) => updateEducation(e.id, { degree: ev.target.value })} placeholder="Degree name" className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />

                        <div className="relative">
                          <input 
                            value={e.institution} 
                            onChange={(ev) => {
                              updateEducation(e.id, { institution: ev.target.value });
                              searchSchools(ev.target.value, e.id);
                            }}
                            placeholder="Institution" 
                            className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          {activeSchoolSearchId === e.id && schoolSearchResults.length > 0 && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {schoolSearchResults.map((school, index) => (
                                <button
                                  key={index}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                                  onClick={() => {
                                    updateEducation(e.id, { institution: school['School Name'] });
                                    setSchoolSearchResults([]);
                                    setActiveSchoolSearchId(null);
                                  }}
                                >
                                  {school['School Name']}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select 
                            value={e.startYear} 
                            onChange={(ev) => updateEducation(e.id, { startYear: ev.target.value })}
                            className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                          >
                            <option value="" className="bg-gray-800 text-white">Start year</option>
                            {years.map((y) => (<option key={y} value={y} className="bg-gray-800 text-white">{y}</option>))}
                          </select>

                          <select
                            value={e.endYear}
                            onChange={(ev) => updateEducation(e.id, { endYear: ev.target.value })}
                            className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                          >
                            <option value="" className="bg-gray-800 text-white">End year</option>
                            {(
                              e.startYear
                                ? years.filter((y) => Number(y) >= Number(e.startYear))
                                : years
                            ).map((y) => (
                              <option key={y} value={y} className="bg-gray-800 text-white">{y}</option>
                            ))}
                            <option value="Present" className="bg-gray-800 text-white">Present</option>
                          </select>

                          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={e.pursuing} onChange={(ev) => updateEducation(e.id, { pursuing: ev.target.checked })} /> Pursuing</label>
                        </div>

                        <div className="flex gap-2 col-span-full">
                          <input value={e.grade} onChange={(ev) => updateEducation(e.id, { grade: ev.target.value })} placeholder="Grade (e.g. 84.6 or 7.39)" className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                          <select 
                            value={e.gradeScale} 
                            onChange={(ev) => updateEducation(e.id, { gradeScale: ev.target.value })}
                            className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                          >
                            <option value="100" className="bg-gray-800 text-white">Percentage (out of 100)</option>
                            <option value="10" className="bg-gray-800 text-white">GPA (out of 10)</option>
                          </select>
                        </div>

                        <div className="col-span-full flex gap-2 items-center">
                          <input 
                            value={e.domain} 
                            onChange={(ev) => updateEducation(e.id, { domain: ev.target.value })}
                            placeholder="Institute domain (e.g. mit.edu)"
                            className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          <button
                            onClick={() => updateFaviconFromDomain(e.domain, e.id, true)}
                            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-sm"
                            disabled={!e.domain}
                          >
                            Fetch Logo
                          </button>
                          <div className="flex gap-2 items-center">
                            {e.logo && (
                              <Image src={e.logo} alt="Logo" width={24} height={24} className="w-6 h-6 rounded" />
                            )}
                            <CldUploadWidget
                              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                              options={{ multiple: false, folder: "education_logos" }}
                              onSuccess={(res: CloudinaryUploadResultInfo) => {
                                if (res?.info?.secure_url) updateEducation(e.id, { logo: res.info.secure_url });
                              }}
                            >
                              {({ open }) => (
                                <button type="button" onClick={() => open()} className="px-3 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition">
                                  {e.logo ? "Change Logo" : "Upload Logo"}
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

            {current.type === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    {experience.length > 0 ? "Your work experiences" : "Add your work / project experiences"} — optional, tap examples to autofill
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addExperience()} className="text-sm underline hover:text-white transition">+ Add</button>
                  </div>
                </div>

                {experience.length === 0 && (
                  <div className="text-center py-6 text-zinc-400 border border-dashed border-white/20 rounded-xl">
                    No experiences added — you can add some or continue to finish
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {expExamples.map((ex, i) => (
                    <button key={i} onClick={() => addExperience(ex)} className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition">
                      {ex.title} • {ex.company}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3">
                  {experience.map((ex) => (
                    <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/6 rounded-xl border border-white/8">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {ex.logo && (
                            <Image src={ex.logo} alt="Logo" width={24} height={24} className="w-6 h-6 rounded" />
                          )}
                          <div>
                            <strong className="text-sm">{ex.title}</strong>
                            <div className="text-xs text-zinc-300">{ex.company}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => removeExperience(ex.id)} className="text-xs hover:text-red-300 transition">Remove</button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Row 1: Title and Company */}
                        <input value={ex.title} onChange={(ev) => updateExperience(ex.id, { title: ev.target.value })} placeholder="Role / Title" className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                        
                        <div className="relative">
                          <input 
                            value={ex.company} 
                            onChange={(ev) => {
                              updateExperience(ex.id, { company: ev.target.value });
                              searchCompanies(ev.target.value, ex.id);
                            }}
                            placeholder="Company / Project" 
                            className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          {activeCompanySearchId === ex.id && companySearchResults.length > 0 && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {companySearchResults.map((company, index) => (
                                <button
                                  key={index}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-700 text-sm border-b border-gray-600 last:border-b-0"
                                  onClick={() => {
                                    updateExperience(ex.id, { company: company.Company_name });
                                    setCompanySearchResults([]);
                                    setActiveCompanySearchId(null);
                                  }}
                                >
                                  <div className="font-medium">{company.Company_name}</div>
                                  {company.Description && (
                                    <div className="text-xs text-gray-400 truncate">{company.Description}</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Row 2: Company URL - full width */}
                        <div className="col-span-full flex gap-2 items-center">
                          <input 
                            value={ex.companyUrl} 
                            onChange={(ev) => updateExperience(ex.id, { companyUrl: ev.target.value })}
                            placeholder="Company URL (optional)" 
                            className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" 
                          />
                          <button
                            onClick={() => updateFaviconFromDomain(ex.companyUrl, ex.id, false)}
                            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 transition text-sm whitespace-nowrap"
                            disabled={!ex.companyUrl}
                          >
                            Fetch Logo
                          </button>
                        </div>

                        {/* Row 3: Date inputs - full width */}
                        <div className="col-span-full flex items-center gap-4">
                          <div className="flex-1 flex gap-2 items-center">
                            <input type="month" value={ex.start} onChange={(ev) => updateExperience(ex.id, { start: ev.target.value })} className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                            <span className="text-zinc-400">to</span>
                            <input type="month" value={ex.end} onChange={(ev) => updateExperience(ex.id, { end: ev.target.value })} className="flex-1 px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                          </div>
                          <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <input type="checkbox" checked={ex.present} onChange={(ev) => updateExperience(ex.id, { present: ev.target.checked })} /> 
                            Present
                          </label>
                        </div>

                        {/* Row 4: Description - full width */}
                        <div className="col-span-full">
                          <textarea value={ex.description} onChange={(ev) => updateExperience(ex.id, { description: ev.target.value })} placeholder="Short description / responsibilities" className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none" />
                        </div>

                        {/* Row 5: Skills and logo upload - full width */}
                        <div className="col-span-full flex flex-wrap gap-4 items-center">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs mb-1">Skills acquired (comma separated)</label>
                            <input
                              value={ex.skills?.join(", ")}
                              onChange={(ev) => updateExperience(ex.id, { skills: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                              placeholder="e.g. React, Node, Docker"
                              className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>

                          <div className="flex gap-4 items-center">
                            {ex.logo && (
                              <Image src={ex.logo} alt="Logo" width={24} height={24} className="w-6 h-6 rounded" />
                            )}
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2 items-center">
                                <div className="text-xs whitespace-nowrap">Company logo</div>
                                <CldUploadWidget
                                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                                  options={{ multiple: false, folder: "company_logos" }}
                                  onSuccess={(res: CloudinaryUploadResultInfo) => {
                                    if (res?.info?.secure_url) updateExperience(ex.id, { logo: res.info.secure_url });
                                  }}
                                >
                                  {({ open }) => (
                                    <button type="button" onClick={() => open()} className="px-3 py-1 rounded-full bg-white/10 text-sm whitespace-nowrap hover:bg-white/20 transition">
                                      {ex.logo ? "Change Logo" : "Upload Logo"}
                                    </button>
                                  )}
                                </CldUploadWidget>
                              </div>
                              
                              <div className="flex gap-2 items-center">
                                <div className="text-xs whitespace-nowrap">Offer letter</div>
                                <CldUploadWidget
                                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                                  options={{ multiple: false, folder: "offer_letters", resourceType: "image" }}
                                  onSuccess={(res: CloudinaryUploadResultInfo) => {
                                    if (res?.info?.secure_url) updateExperience(ex.id, { offerLetter: res.info.secure_url });
                                  }}
                                >
                                  {({ open }) => (
                                    <button type="button" onClick={() => open()} className="px-3 py-1 rounded-full bg-white/10 text-sm whitespace-nowrap hover:bg-white/20 transition">Upload Offer</button>
                                  )}
                                </CldUploadWidget>
                              </div>
                            </div>
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
                <button onClick={handleBack} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition">← Back</button>
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
                  {saving ? "Saving..." : isLast ? "Finish 🎉" : "Next →"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div className="text-center py-10 text-2xl font-semibold text-white-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-4">
              <div>Awesome! Your About section is {roles.length > 0 || bio || education.length > 0 || experience.length > 0 ? 'updated' : 'ready'} 🚀</div>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard" className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform">
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => {
                    setDone(false);
                    fetchExistingData();
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