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
  CloudinaryUploadResultInfo,
  RoleEntry
} from '@/util/types';

// NOTE: ensure your ExperienceEntry in '@/util/types' matches the shape used below:
// ExperienceEntry = { id, company, companyUrl, logo, roles: RoleEntry[] }
// RoleEntry = { id, title, start, end, present, description, skills, skillsInput, attachments }

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

        // Normalize experience: convert legacy items into company+roles shape if needed
        const exs: ExperienceEntry[] = (data.experience || []).map((ex: any) => {
          // If ex already has roles, ensure skillsInput exists for each role
          if (ex.roles && Array.isArray(ex.roles)) {
            return {
              ...ex,
              roles: ex.roles.map((r: any) => ({
                ...r,
                skillsInput: r.skills ? r.skills.join(", ") : (r.skillsInput ?? ""),
                attachments: r.attachments ?? [],
              })),
            };
          }

          // If legacy flat experience (single role per company), map to roles array
          return {
            id: ex.id ?? Math.random().toString(36).slice(2),
            company: ex.company ?? ex.companyName ?? "Company / Project",
            companyUrl: ex.companyUrl ?? ex.company_url ?? "",
            logo: ex.logo ?? "",
            roles: [
              {
                id: Math.random().toString(36).slice(2),
                title: ex.title ?? "Role title",
                start: ex.start ?? "",
                end: ex.end ?? "",
                present: ex.present ?? false,
                description: ex.description ?? "",
                skills: ex.skills ?? [],
                skillsInput: ex.skills ? ex.skills.join(", ") : (ex.skillsInput ?? ""),
                attachments: ex.attachments ?? (ex.offerLetter ? [ex.offerLetter] : []),
              }
            ],
          };
        });

        setExperience(exs);
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
      alert("Failed to load existing profile data");
    } finally {
      setLoading(false);
    }
  };

  // Resume-based examples (education)
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

  // Example companies with roles (for quick add)
const expExamples: Partial<ExperienceEntry>[] = [
  {
    company: "TechInnovate Solutions",
    companyUrl: "",
    logo: "",
    roles: [
      {
        id: Math.random().toString(36).slice(2),
        title: "Frontend Engineer Intern",
        start: "2024-06",
        end: "2024-09",
        present: false,
        skills: ["React", "TypeScript", "Redux", "Jest"],
        description: "Built responsive front-end components and improved engagement.",
      }
    ]
  },
  {
    company: "DigitalFlow Systems",
    roles: [
      {
        id: Math.random().toString(36).slice(2),
        title: "Full Stack Developer",
        start: "2024-10",
        end: "",
        present: true,
        skills: ["Next.js", "Node.js", "PostgreSQL", "AWS"],
        description: "Building scalable full-stack applications with Next.js and Node.js.",
      }
    ]
  },
  {
    company: "CloudNexa Technologies",
    roles: [
      {
        id: Math.random().toString(36).slice(2),
        title: "Software Engineering Intern",
        start: "2024-01",
        end: "2024-05",
        skills: ["Python", "Django", "Docker", "REST APIs"],
        description: "Contributed to backend services and cut response times.",
      }
    ]
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
// updated — accepts undefined and null, guards early
const updateFaviconFromDomain = useCallback((domain?: string | null, id?: string, isEducation = false): void => {
  if (!domain || !id) return; // guard when domain or id is missing

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


  // helpers for education (unchanged)
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

  // helpers for experience (company-level with multiple roles)
  const makeRole = (seed?: Partial<any>) => ({
    id: Math.random().toString(36).slice(2),
    title: seed?.title ?? "Role title",
    start: seed?.start ?? "",
    end: seed?.end ?? "",
    present: seed?.present ?? false,
    description: seed?.description ?? "",
    skills: seed?.skills ?? [],
    skillsInput: seed?.skills ? seed.skills.join(", ") : (seed?.skillsInput ?? ""),
    attachments: seed?.attachments ?? [],
  });

  const makeExperience = (seed?: Partial<ExperienceEntry>): ExperienceEntry => ({
    id: Math.random().toString(36).slice(2),
    company: seed?.company ?? "Company / Project",
    companyUrl: seed?.companyUrl ?? "",
    logo: seed?.logo ?? "",
    roles: (seed?.roles && Array.isArray(seed.roles)) ? seed.roles.map((r: any) => ({
      ...makeRole(r)
    })) : [ makeRole(seed?.roles ?? undefined) ],
  });

  const addExperience = (seed?: Partial<ExperienceEntry>): void => setExperience((s) => [...s, makeExperience(seed)]);
  const updateExperience = (id: string, patch: Partial<ExperienceEntry>): void =>
    setExperience((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeExperience = (id: string): void => setExperience((s) => s.filter((e) => e.id !== id));

  // role-level helpers
  const addRoleToCompany = (companyId: string, seed?: Partial<any>): void => {
    setExperience((s) =>
      s.map((ex) =>
        ex.id === companyId ? { ...ex, roles: [...ex.roles, makeRole(seed)] } : ex
      )
    );
  };

  const updateRole = (companyId: string, roleId: string, patch: Partial<any>): void => {
    setExperience((s) =>
      s.map((ex) =>
        ex.id === companyId ? { ...ex, roles: ex.roles.map((r) => (r.id === roleId ? { ...r, ...patch } : r)) } : ex
      )
    );
  };

  const removeRole = (companyId: string, roleId: string): void => {
    setExperience((s) =>
      s.map((ex) =>
        ex.id === companyId ? { ...ex, roles: ex.roles.filter((r) => r.id !== roleId) } : ex
      )
    );
  };

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

      // Clean transient fields: skillsInput only
      const cleanedExperience = experience.length
        ? experience.map((ex) => ({
            ...ex,
            // map roles to remove transient skillsInput
            roles: ex.roles.map(({ skillsInput, ...rest }: any) => rest),
          }))
        : null;

      const payload = {
        auth_user_id: user.id,
        roles: roles.length ? roles : null,
        bio: bio || null,
        education: education.length ? education : null,
        experience: cleanedExperience,
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
    "Full-stack Developer",
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
        <div className="w-full max-w-4xl bg-white/8 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <div className="text-xl">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-24 md:pt-32 items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-6 md:py-10">
      {/* widened container for desktop to give experience cards more room */}
      <motion.div
        key={current.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/8 backdrop-blur-xl rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl"
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
                        className="text-xs opacity-80 hover:opacity-100 p-1"
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
                    placeholder="Add a role (e.g. Full-stack Engineer)"
                    className="flex-1 text-center px-4 py-3 rounded-full bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button
                    onClick={() => addRole(input)}
                    className="px-4 py-3 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform whitespace-normal"
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
                      className="bg-white/10 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition whitespace-normal"
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
                    <button
                      onClick={() => addEducation()}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition flex items-center gap-2"
                    >
                      + Add
                    </button>
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
                    <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white/6 rounded-xl border border-white/8">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {e.logo && (
                            <Image src={e.logo} alt="Logo" width={24} height={24} className="w-6 h-6 rounded" />
                          )}
                          <strong className="text-sm break-words">{e.level} — {e.degree}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => removeEducation(e.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                            </svg>
                            Remove
                          </button>
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
                            className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none break-words" 
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
                                <button type="button" onClick={() => open()} className="px-3 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition whitespace-normal">
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
                    <button
                      onClick={() => addExperience()}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition flex items-center gap-2"
                    >
                      + Add Company
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {expExamples.map((ex, i) => (
                    <button key={i} onClick={() => addExperience(ex)} className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/20 transition whitespace-normal">
                      {ex.roles?.[0]?.title ?? "Role"} • {ex.company}
                    </button>
                  ))}
                </div>

                <div className="mt-3 space-y-3">
                  {experience.map((ex) => (
                    <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-white/6 rounded-xl border border-white/8">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {ex.logo && <Image src={ex.logo} alt="Logo" width={40} height={40} className="w-10 h-10 rounded object-cover flex-shrink-0" />}
                          <div className="min-w-0">
                            <input
                              value={ex.company}
                              onChange={(ev) => updateExperience(ex.id, { company: ev.target.value })}
                              placeholder="Company / Project"
                              className="text-lg font-semibold bg-transparent border-b border-white/10 pb-1 outline-none w-full truncate"
                            />
                            {/* COMPANY URL: styled clearly as a field with label */}
                            <label className="text-xs text-zinc-400 block mt-1">Company URL (optional)</label>
                            <input
                              value={ex.companyUrl}
                              onChange={(ev) => updateExperience(ex.id, { companyUrl: ev.target.value })}
                              placeholder="https://example.com or example.com"
                              className="mt-1 text-xs px-2 py-2 rounded-md bg-white/5 border border-white/12 text-white focus:ring-2 focus:ring-blue-400 outline-none w-full"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                            options={{ multiple: false, folder: "company_logos" }}
                            onSuccess={(res: CloudinaryUploadResultInfo) => {
                              if (res?.info?.secure_url) updateExperience(ex.id, { logo: res.info.secure_url });
                            }}
                          >
                            {({ open }) => (
                              <button type="button" onClick={() => open()} className="px-3 py-1.5 rounded-full bg-white/10 text-sm hover:bg-white/20 transition whitespace-normal">
                                {ex.logo ? "Change Logo" : "Upload Logo"}
                              </button>
                            )}
                          </CldUploadWidget>

                          <button onClick={() => updateFaviconFromDomain(ex.companyUrl, ex.id, false)} disabled={!ex.companyUrl} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-sm whitespace-normal">
                            Fetch Logo
                          </button>

                          {/* Company remove button — more visible/destructive */}
                          <button
                            onClick={() => removeExperience(ex.id)}
                            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200 bg-red-600/10 hover:bg-red-600/20 px-3 py-1.5 rounded-md transition"
                            title="Remove company and all roles"
                          >
                            {/* simple SVG trash icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                              <path d="M10 11v6"></path>
                              <path d="M14 11v6"></path>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                            </svg>
                            Remove Company
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {/* Roles list - each role is a responsive grid */}
                        {ex.roles.map((role) => (
                          <div key={role.id} className="p-4 bg-white/5 rounded-md border border-white/8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* left: details (span 2 on md) */}
                              <div className="md:col-span-2 min-w-0">
                                <input
                                  value={role.title}
                                  onChange={(ev) => updateRole(ex.id, role.id, { title: ev.target.value })}
                                  placeholder="Role / Title"
                                  className="w-full px-2 py-2 rounded-md bg-transparent border-b border-white/10 outline-none truncate"
                                />

                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                  <input type="month" value={role.start} onChange={(ev) => updateRole(ex.id, role.id, { start: ev.target.value })} className="px-2 py-1 rounded-md bg-white/6 border border-white/10 outline-none" />
                                  <span className="text-zinc-400">to</span>
                                  <input type="month" value={role.end} onChange={(ev) => updateRole(ex.id, role.id, { end: ev.target.value })} className="px-2 py-1 rounded-md bg-white/6 border border-white/10 outline-none" />
                                  <label className="flex items-center gap-2 ml-3 text-sm whitespace-nowrap">
                                    <input type="checkbox" checked={role.present} onChange={(ev) => updateRole(ex.id, role.id, { present: ev.target.checked })} />
                                    Present
                                  </label>
                                </div>

                                <textarea
                                  value={role.description}
                                  onChange={(ev) => updateRole(ex.id, role.id, { description: ev.target.value })}
                                  placeholder="Short description / responsibilities"
                                  className="w-full mt-2 px-2 py-2 rounded-md bg-white/6 border border-white/10 outline-none min-h-[80px] resize-vertical"
                                />

                                <div className="mt-2">
                                  <label className="block text-xs mb-1">Skills acquired (comma separated)</label>

                                  <input
                                    value={role.skillsInput ?? role.skills?.join(", ") ?? ""}
                                    onChange={(ev) => updateRole(ex.id, role.id, { skillsInput: ev.target.value })}
                                    onBlur={() => {
                                      const raw = (role.skillsInput ?? role.skills?.join(", ") ?? "");
                                      const skillsArray = raw.split(",").map((s) => s.trim()).filter(Boolean);
                                      updateRole(ex.id, role.id, { skills: skillsArray, skillsInput: raw });
                                    }}
                                    onKeyDown={(e) => { if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur(); }}
                                    placeholder="e.g. React, Node, Docker"
                                    className="w-full px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                                  />
                                  <div className="text-xs text-zinc-400 mt-1">Separate skills with commas — editing preserves your commas until you leave the field.</div>
                                </div>
                              </div>

                              {/* right: attachments & controls */}
                              <div className="flex flex-col items-stretch gap-3">
                                <div className="flex items-center justify-between gap-2">
                                  {/* Role remove button — more visible/destructive */}
                                  <button
                                    onClick={() => removeRole(ex.id, role.id)}
                                    className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200 bg-red-600/10 hover:bg-red-600/20 px-3 py-1.5 rounded-md transition"
                                    title="Remove this role"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                      <polyline points="3 6 5 6 21 6"></polyline>
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                      <path d="M10 11v6"></path>
                                      <path d="M14 11v6"></path>
                                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                                    </svg>
                                    Remove Role
                                  </button>

                                  <div className="text-xs text-zinc-400">Attachments</div>
                                </div>

                                <CldUploadWidget
                                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                                  options={{ multiple: false, folder: "role_attachments", resourceType: "image" }}
                                  onSuccess={(res: CloudinaryUploadResultInfo) => {
                                    if (res?.info?.secure_url) {
                                      const newUrl = res.info.secure_url;
                                      updateRole(ex.id, role.id, { attachments: [...(role.attachments ?? []), newUrl] });
                                    }
                                  }}
                                >
                                  {({ open }) => (
                                    <button type="button" onClick={() => open()} className="w-full px-3 py-1.5 rounded-full bg-white/10 text-sm whitespace-normal hover:bg-white/20 transition">
                                      Upload
                                    </button>
                                  )}
                                </CldUploadWidget>

                                <div className="flex flex-wrap gap-2">
                                  {role.attachments?.map((att, idx) => (
                                    <div key={idx} className="relative w-14 h-14 rounded overflow-hidden bg-gray-700">
                                      <Image src={att} alt={`att-${idx}`} width={56} height={56} className="object-cover w-full h-full" />
                                      <button
                                        onClick={() => {
                                          const filtered = (role.attachments || []).filter((a) => a !== att);
                                          updateRole(ex.id, role.id, { attachments: filtered });
                                        }}
                                        className="absolute -top-1 -right-1 text-xs bg-red-500 rounded-full w-5 h-5 flex items-center justify-center"
                                        title="Remove attachment"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="mt-2">
                          <button onClick={() => addRoleToCompany(ex.id)} className="px-3 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition whitespace-normal">+ Add Role</button>
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
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold hover:scale-105 transition-transform disabled:opacity-50 active:scale-95"
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
