"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CldUploadWidget } from "next-cloudinary";
import { supabase } from "@/lib/supabaseClient";
import debounce from 'lodash/debounce';
import type {
  ProjectItem,
  ProjectMedia,
  ProjectQuestion,
  ProjectExample,
  TechItem,
  CloudinaryUploadInfo,
} from "@/util/types";

export default function ProjectForm() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);

  const [projectSearch, setProjectSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // Search states for tech stack
  const [techSearchResults, setTechSearchResults] = useState<TechItem[]>([]);
  const [activeTechSearchId, setActiveTechSearchId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const questions = [
    { key: "projects", title: "🚀 Add your projects", type: "projects" },
  ];

  const current = questions[step];

  // Project examples based on the resume
  const projectExamples = [
    {
      title: "Centralised Ayush-Registration-Portal",
      overview: "Centralised Ayush-Registration-Portal Prototype based on Firebase",
      role: "Full-stack Developer",
      techStack: [
        { name: "React", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" },
        { name: "Google Firebase", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-plain.svg" },
        { name: "JavaScript", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" }
      ],
      process: "Developed a registration portal for registering and monitoring startup registrations for SIH 2024. Implemented using Google Firebase services and React.js",
      results: "Successfully created a prototype for startup registration and monitoring system",
      media: [],
      repoLink: ""
    },
    {
      title: "Jharkhand Tour Promoting Application",
      overview: "A Next.js & Supabase-powered tourism platform showcasing Jharkhand's culture, heritage, and natural beauty",
      role: "Full-stack Developer",
      techStack: [
        { name: "Next.js", logo_url: null },
        { name: "Supabase", logo_url: null },
        { name: "Google Gemini AI", logo_url: null },
        { name: "MapLibre", logo_url: null },
        { name: "Tailwind", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" },
        { name: "Node.js", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" },
        { name: "Blockchain", logo_url: null }
      ],
      process: "Built a comprehensive tourism platform with AI-powered tour planning, interactive maps, booking system with blockchain payments, user profiles, reviews, and artisan product listings",
      results: "Created a full-featured tourism application with modern tech stack and AI integration",
      media: [],
      repoLink: ""
    },
    {
      title: "CO₂ Level Prediction System",
      overview: "CO₂ Level Prediction Using Lagrange Interpolation",
      role: "Embedded Systems Developer",
      techStack: [
        { name: "Arduino", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/arduino/arduino-original.svg" },
        { name: "C++", logo_url: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg" },
        { name: "Numerical Methods", logo_url: null }
      ],
      process: "Applied Arduino-based data acquisition and numerical methods to develop a system for predicting CO₂ levels. Gained hands-on experience in hardware-software integration",
      results: "Developed a functional CO₂ prediction system using mathematical interpolation methods",
      media: [],
      repoLink: ""
    }
  ];

  // Tech stack examples - now with names only, we'll fetch logos when added
  const techExamples = [
    "React", "Next.js", "Node.js", "Python", "JavaScript", "TypeScript",
    "Supabase", "PostgreSQL", "Firebase", "Arduino", "Solidity", "Java",
    "MATLAB", "SolidWorks", "Tailwind CSS", "MapLibre", "Google Gemini AI"
  ];

  // Fetch existing projects on component mount
  useEffect(() => {
    fetchExistingProjects();
  }, []);

  // Function to fetch existing projects
  const fetchExistingProjects = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("project")
        .select("projects")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Error fetching projects:", error);
      }

      if (data && data.projects) {
        // Ensure all projects have proper IDs and structure
        const projectsWithIds = data.projects.map((project: any) => ({
          ...project,
          id: project.id || Math.random().toString(36).slice(2),
          techStack: project.techStack || [],
          media: project.media || []
        }));
        setProjects(projectsWithIds);
      }
    } catch (error) {
      console.error("Error fetching existing projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch logo for a tech skill
  const fetchTechLogo = async (techName: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("technical_skills")
        .select('logo_url')
        .eq('name', techName)
        .single();

      if (error || !data) {
        console.warn(`No logo found for ${techName}`);
        return null;
      }
      return data.logo_url;
    } catch (error) {
      console.error("Error fetching tech logo:", error);
      return null;
    }
  };

  // Function to fetch multiple tech logos
  const fetchTechLogos = async (techNames: string[]): Promise<{name: string, logo_url: string | null}[]> => {
    try {
      const { data, error } = await supabase
        .from("technical_skills")
        .select('name, logo_url')
        .in('name', techNames);

      if (error) throw error;

      // Map the results back to the input order
      return techNames.map(name => {
        const found = data?.find(item => item.name === name);
        return { name, logo_url: found?.logo_url || null };
      });
    } catch (error) {
      console.error("Error fetching tech logos:", error);
      return techNames.map(name => ({ name, logo_url: null }));
    }
  };

  // Debounced search for technical skills
  const searchTechSkills = useCallback(
    debounce(async (query: string, projectId: string) => {
      if (!query || query.length < 2) {
        setTechSearchResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("technical_skills")
          .select('name, category, logo_url')
          .ilike('name', `%${query}%`)
          .limit(10);

        if (error) throw error;
        setTechSearchResults(data || []);
        setActiveTechSearchId(projectId);
        setActiveProjectId(projectId);
      } catch (error) {
        console.error("Error searching tech skills:", error);
        setTechSearchResults([]);
      }
    }, 500),
    []
  );

  // Helper functions for projects
  const makeProject = (seed?: any) => ({
    id: Math.random().toString(36).slice(2),
    title: seed?.title ?? "Project Title",
    overview: seed?.overview ?? "Brief project description",
    role: seed?.role ?? "Your role in the project",
    techStack: seed?.techStack ?? [],
    process: seed?.process ?? "Development process and methodology",
    results: seed?.results ?? "Key results and achievements",
    media: seed?.media ?? [],
    repoLink: seed?.repoLink ?? "",
  });

  const addProject = async (seed?: any) => {
    const newProject = makeProject(seed);
    
    // If the seed has techStack with just names, fetch their logos
    if (seed?.techStack && seed.techStack.length > 0) {
      const techNames = seed.techStack.map((tech: any) => typeof tech === 'string' ? tech : tech.name);
      const techWithLogos = await fetchTechLogos(techNames);
      newProject.techStack = techWithLogos;
    }
    
    setProjects((s) => [newProject, ...s]);
    setCurrentPage(1);
    setProjectSearch(""); // Clear search to show the new project
  };

  const updateProject = (id: string, patch: any) =>
    setProjects((s) => s.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removeProject = (id: string) => setProjects((s) => s.filter((p) => p.id !== id));

  // Media management
  const addMedia = (projectId: string, type: string = "image") => {
    const newMedia: ProjectMedia = {
      id: Math.random().toString(36).slice(2),
      type: type as ProjectMedia["type"],
      url: ""
    };

    setProjects((s) => s.map((p) => 
      p.id === projectId 
        ? { ...p, media: [...p.media, newMedia] }
        : p
    ));
  };

  const updateMedia = (projectId: string, mediaId: string, patch: any) => {
    setProjects((s) => s.map((p) => 
      p.id === projectId 
        ? { 
            ...p, 
            media: p.media.map((m: any) => 
              m.id === mediaId ? { ...m, ...patch } : m
            ) 
          }
        : p
    ));
  };

  const removeMedia = (projectId: string, mediaId: string) => {
    setProjects((s) => s.map((p) => 
      p.id === projectId 
        ? { ...p, media: p.media.filter((m: any) => m.id !== mediaId) }
        : p
    ));
  };

  // Tech stack management
  const addTechToProject = async (projectId: string, techInput: string) => {
    if (!techInput) return;
    
    const logo_url = await fetchTechLogo(techInput);
    const newTech = { name: techInput, logo_url };
    
    setProjects((s) => s.map((p) => 
      p.id === projectId 
        ? { 
            ...p, 
            techStack: Array.from(
              new Set([newTech, ...p.techStack].map(tech => tech.name))
            ).map(name => 
              [newTech, ...p.techStack].find(tech => tech.name === name)
            )
              .filter((tech): tech is TechItem => tech !== undefined)
          }
        : p
    ));
    setInput("");
  };

  const removeTechFromProject = (projectId: string, techName: string) => {
    setProjects((s) => s.map((p) => 
      p.id === projectId 
        ? { ...p, techStack: p.techStack.filter((t: any) => t.name !== techName) }
        : p
    ));
  };

  const handleNext = async () => {
    if (current.type === "projects" && projects.length === 0) {
      addProject();
      return;
    }

    await handleSubmit();
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const payload = {
        id: user.id,
        projects: projects.length ? projects : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("project").upsert(payload);
      if (error) throw error;
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to save projects");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading your projects...</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 md:pt-32 flex flex-col items-center justify-center bg-gradient-to-tr from-green-900 via-blue-900 to-purple-900 text-white px-4 py-10">
      <motion.div
        key={current.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/8 backdrop-blur-xl rounded-3xl p-4 md:p-8 border border-white/10 shadow-2xl"
      >
        {!done ? (
          <>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-6">
              {current.title}
            </h1>

            {current.type === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-300">
                    {projects.length > 0 
                      ? `Edit your ${projects.length} project${projects.length > 1 ? 's' : ''} — tap examples to autofill` 
                      : "Add your projects — tap examples to autofill"
                    }
                  </div>
                  
                  {/* Search Bar */}
                  {projects.length > 0 && (
                    <div className="w-full md:w-auto relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder="Search projects by name..."
                        className="w-full md:w-64 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all"
                      />
                      {projectSearch && (
                        <button 
                          onClick={() => setProjectSearch("")}
                          className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => addProject()} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm transition-all active:scale-95 cursor-pointer">+ Add Project</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {projectExamples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => addProject(ex)}
                      className="bg-white/8 px-3 py-1 rounded-full text-sm hover:bg-white/20 cursor-pointer active:scale-95 transition-transform"
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-6">
                  {filteredProjects.length === 0 && projectSearch && (
                    <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-zinc-400">No projects found matching "{projectSearch}"</p>
                      <button 
                        onClick={() => setProjectSearch("")}
                        className="mt-2 text-sm text-blue-300 hover:text-blue-200 underline"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                  {filteredProjects
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((project) => (
                    <motion.div 
                      key={project.id} 
                      initial={{ opacity: 0, y: 8 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="p-6 bg-white/6 rounded-xl border border-white/8"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <button 
                          onClick={() => removeProject(project.id)} 
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs transition-all active:scale-95 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Project Title */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs text-zinc-300 mb-1">Project Title</label>
                          <input
                            value={project.title}
                            onChange={(e) => updateProject(project.id, { title: e.target.value })}
                            placeholder="e.g., E-commerce Platform"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>

                        {/* Overview */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs text-zinc-300 mb-1">Overview</label>
                          <textarea
                            value={project.overview}
                            onChange={(e) => updateProject(project.id, { overview: e.target.value })}
                            placeholder="Brief description of your project"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none min-h-[80px]"
                          />
                        </div>

                        {/* Role */}
                        <div>
                          <label className="block text-xs text-zinc-300 mb-1">Your Role</label>
                          <input
                            value={project.role}
                            onChange={(e) => updateProject(project.id, { role: e.target.value })}
                            placeholder="e.g., Full-stack Developer"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>

                        {/* Repository Link */}
                        <div>
                          <label className="block text-xs text-zinc-300 mb-1">Repository Link</label>
                          <input
                            value={project.repoLink}
                            onChange={(e) => updateProject(project.id, { repoLink: e.target.value })}
                            placeholder="https://github.com/username/repo"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                          />
                        </div>

                        {/* Tech Stack */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs text-zinc-300 mb-1">Tech Stack</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.techStack.map((tech: any) => (
                              <span
                                key={tech.name}
                                className="px-3 py-1 bg-white/12 rounded-full flex items-center gap-2 text-sm"
                              >
                                {tech.logo_url && (
                                  <img src={tech.logo_url} alt={tech.name} className="w-4 h-4 rounded" />
                                )}
                                {tech.name}
                                <button
                                  onClick={() => removeTechFromProject(project.id, tech.name)}
                                  className="text-xs opacity-80 hover:opacity-100 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-2 mb-2">
                            <input
                              value={input}
                              onChange={(e) => {
                                setInput(e.target.value);
                                searchTechSkills(e.target.value, project.id);
                              }}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                  await addTechToProject(project.id, input);
                                }
                              }}
                              placeholder="Add technology (e.g., React, Node.js)"
                              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none w-full"
                            />
                            <button
                              onClick={() => addTechToProject(project.id, input)}
                              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95 transition-transform"
                            >
                              Add
                            </button>
                          </div>

                          {/* Tech Search Results */}
                          {activeTechSearchId === project.id && techSearchResults.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-800/80 rounded-lg border border-gray-600">
                              <div className="text-xs text-zinc-400 mb-2">Search results:</div>
                              <div className="flex flex-wrap gap-2">
                                {techSearchResults.map((skill, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setProjects((s) => s.map((p) => 
                                        p.id === project.id 
                                          ? { 
                                              ...p, 
                                              techStack: Array.from(
                                                new Set([...p.techStack, skill].map(tech => tech.name))
                                              ).map(name => 
                                                [...p.techStack, skill].find(tech => tech.name === name)
                                              )   .filter((tech): tech is TechItem => tech !== undefined)
                                            }
                                          : p
                                      ));
                                      setTechSearchResults([]);
                                      setActiveTechSearchId(null);
                                    }}
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                                  >
                                    {skill.logo_url && (
                                      <img src={skill.logo_url} alt={skill.name} className="w-4 h-4 rounded" />
                                    )}
                                    {skill.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Tech Examples */}
                          <div className="mt-2">
                            <div className="text-xs text-zinc-400 mb-2">Quick add:</div>
                            <div className="flex flex-wrap gap-2">
                              {techExamples.map((tech) => (
                                <button
                                  key={tech}
                                  onClick={() => addTechToProject(project.id, tech)}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm cursor-pointer active:scale-95 transition-transform"
                                >
                                  {tech}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Process */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs text-zinc-300 mb-1">Development Process</label>
                          <textarea
                            value={project.process}
                            onChange={(e) => updateProject(project.id, { process: e.target.value })}
                            placeholder="Describe your development methodology, challenges faced, and how you overcame them"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none min-h-[100px]"
                          />
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2">
                          <label className="block text-xs text-zinc-300 mb-1">Results & Achievements</label>
                          <textarea
                            value={project.results}
                            onChange={(e) => updateProject(project.id, { results: e.target.value })}
                            placeholder="What were the outcomes? Any metrics, user feedback, or key achievements?"
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none min-h-[100px]"
                          />
                        </div>

                        {/* Media */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-zinc-300">Media & Links</label>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => addMedia(project.id, "image")}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-all active:scale-95 cursor-pointer"
                              >
                                + Add Image
                              </button>
                              <button 
                                onClick={() => addMedia(project.id, "video")}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-all active:scale-95 cursor-pointer"
                              >
                                + Add Video
                              </button>
                              <button 
                                onClick={() => addMedia(project.id, "deployment")}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs transition-all active:scale-95 cursor-pointer"
                              >
                                + Add Deployment
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {project.media.map((media: any) => (
                              <div key={media.id} className="flex flex-col md:flex-row gap-3 items-stretch md:items-start">
                                <select
                                  value={media.type}
                                  onChange={(e) => updateMedia(project.id, media.id, { type: e.target.value })}
                                  className="px-2 py-2 rounded-md bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer"
                                >
                                  <option value="image" className="bg-gray-800 text-white">Image</option>
                                  <option value="video" className="bg-gray-800 text-white">Video</option>
                                  <option value="deployment" className="bg-gray-800 text-white">Deployment</option>
                                </select>
                                
                                <input
                                  value={media.url}
                                  onChange={(e) => updateMedia(project.id, media.id, { url: e.target.value })}
                                  placeholder={
                                    media.type === "image" ? "Image URL" :
                                    media.type === "video" ? "Video URL" :
                                    "Deployment URL"
                                  }
                                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none w-full"
                                />

                                <div className="flex gap-2">
                                  {/* Upload widget for images */}
                                  {media.type === "image" && (
                                    <CldUploadWidget
                                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                                      options={{ multiple: false, folder: "project_media" }}
                                      onSuccess={(res: any) => {
                                        if (res?.info?.secure_url) {
                                          updateMedia(project.id, media.id, { url: res.info.secure_url });
                                        }
                                      }}
                                    >
                                      {({ open }) => (
                                        <button
                                          type="button"
                                          onClick={() => open()}
                                          className={`flex-1 md:flex-none px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95 transition-transform text-sm whitespace-nowrap ${media.url ? "hidden md:block" : ""}`}
                                        >
                                          Upload
                                        </button>
                                      )}
                                    </CldUploadWidget>
                                  )}

                                  <button
                                    onClick={() => removeMedia(project.id, media.id)}
                                    className="flex-1 md:flex-none px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 cursor-pointer active:scale-95 transition-transform text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Projects Pagination */}
                {Math.ceil(projects.length / ITEMS_PER_PAGE) > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-zinc-300">
                      Page {currentPage} of {Math.ceil(projects.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(projects.length / ITEMS_PER_PAGE), p + 1))}
                      disabled={currentPage === Math.ceil(projects.length / ITEMS_PER_PAGE)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button onClick={handleBack} className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95 transition-transform">
                  ← Back
                </button>
              ) : (
                <div />
              )}

              <button 
                onClick={handleNext} 
                disabled={saving}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {saving ? "Saving..." : projects.length > 0 ? "Update Projects ✨" : "Save Projects 🎉"}
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            className="text-center py-10 text-2xl font-semibold text-white-300" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            <div className="space-y-4">
              <div>Awesome! Your projects have been {projects.length > 0 ? 'updated' : 'saved'} 🚀</div>
              <div className="flex justify-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 font-semibold cursor-pointer active:scale-95 hover:scale-105 transition-transform"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={() => {
                    setDone(false);
                    // Don't clear projects, let them continue editing
                  }}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer active:scale-95 transition-transform"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}