// app/[username]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Particles from "@/components/particles";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AnimatedName from "@/components/AnimatedName";
import TypingRoles from "@/components/TypingRoles";
import "./portfolio.css"; // Import the CSS file

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type definitions
interface Education {
  id: string;
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
  pursuing: boolean;
  grade: string;
  gradeScale: string;
  level: string;
  logo?: string;
}

interface Experience {
  id: string;
  company: string;
  companyUrl?: string;
  title: string;
  start: string;
  end: string;
  present: boolean;
  description: string;
  logo?: string;
  skills: string[];
}

interface AboutData {
  bio?: string;
  roles?: string[];
  education?: Education[];
  experience?: Experience[];
}

interface Skill {
  id: string;
  name: string;
  logo_url?: string;
}

interface SkillsData {
  technical?: Skill[];
  soft?: string[];
}

interface ProjectMedia {
  type: "image" | "video" | "deployment";
  url: string;
}

interface ProjectTech {
  name: string;
  logo_url?: string;
}

interface Project {
  id: string;
  title: string;
  role: string;
  overview: string;
  process?: string;
  results?: string;
  techStack: ProjectTech[];
  repoLink?: string;
  media: ProjectMedia[];
}

interface ProjectsData {
  projects: Project[];
}

interface ContactLink {
  id: string;
  name: string;
  url: string;
  logo_url?: string;
}

interface ContactData {
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  other_links?: ContactLink[];
}

interface Language {
  id: string;
  name: string;
  proficiency: "Beginner" | "Elementary" | "Intermediate" | "Advanced" | "Fluent" | "Native";
}

interface LangIntData {
  language?: Language[];
  interest?: string[];
}

interface ResumeData {
  resume_url?: string;
}

interface ProfileData {
  uid: string;
  full_name: string;
  photo_url?: string;
}

interface UserData {
  profile: ProfileData;
  about: AboutData | null;
  skills: SkillsData | null;
  projects: ProjectsData | null;
  contact: ContactData | null;
  langint: LangIntData | null;
  resume: ResumeData | null;
}
export default function PortfolioPage() {
  const params = useParams();
  const username = params.username as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);

        // Get user ID from username
        const { data: usernameData, error: usernameError } = await supabase
          .from("users_usernames")
          .select("auth_user_id")
          .eq("username", username)
          .single();

        if (usernameError || !usernameData) {
          setError("User not found");
          setLoading(false);
          return;
        }

        // Fetch all user data including resume
        const [
          { data: profile },
          { data: about },
          { data: skills },
          { data: projects },
          { data: contact },
          { data: langint },
          { data: resume },
        ] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("*")
            .eq("uid", usernameData.auth_user_id)
            .single(),
          supabase
            .from("about")
            .select("*")
            .eq("auth_user_id", usernameData.auth_user_id)
            .single(),
          supabase
            .from("skills")
            .select("*")
            .eq("auth_user_id", usernameData.auth_user_id)
            .single(),
          supabase
            .from("project")
            .select("*")
            .eq("id", usernameData.auth_user_id)
            .single(),
          supabase
            .from("contact")
            .select("*")
            .eq("auth_user_id", usernameData.auth_user_id)
            .single(),
          supabase
            .from("langint")
            .select("*")
            .eq("auth_user_id", usernameData.auth_user_id)
            .single(),
          supabase
            .from("resumes")
            .select("*")
            .eq("auth_user_id", usernameData.auth_user_id)
            .single(),
        ]);

        if (!profile) {
          setError("User profile not found");
          setLoading(false);
          return;
        }

        setUserData({
          profile,
          about,
          skills,
          projects,
          contact,
          langint,
          resume,
        });
      } catch (err) {
        setError("Failed to load portfolio");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  const handleDownloadResume = () => {
    if (userData?.resume?.resume_url) {
      const link = document.createElement('a');
      link.href = userData.resume.resume_url;
      link.download = `Resume_${userData.profile.full_name.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading portfolio...</div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{error || "Portfolio not found"}</div>
      </div>
    );
  }

  const { profile, about, skills, projects, contact, langint, resume } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Particles Background */}
      <Particles 
        className="absolute inset-0 z-0 opacity-60 pointer-events-none" 
        quantity={80} 
      />

      {/* Main Content */}
      <div className="relative pt-30 z-10">
        {/* Hero Section */}
     
<section className="min-h-screen flex items-center justify-center  px-4 pt-20 portfolio-mobile-padding">
  <div className="max-w-6xl mx-auto text-center">
  <div className="flex justify-center items-center pb-12 mb-8 animate-fade-in">
  {profile.photo_url && (
    <div className="relative">
      <Image
        src={profile.photo_url}
        alt={profile.full_name}
        width={200}
        height={200}
        className="rounded-full border-4 border-purple-400 shadow-2xl shadow-purple-500/50 hover:scale-105 transition-transform duration-300 hover-lift"
      />
      {/* Static glow */}
      <div className="profile-photo-glow"></div>
    </div>
  )}
</div>
    
    {/* Animated Name Component */}
    <AnimatedName name={profile.full_name} />
    
    {/* Typing Roles Component */}
    {about?.roles && about.roles.length > 0 && (
      <TypingRoles roles={about.roles} />
    )}

    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-delay portfolio-mobile-text">
      {about?.bio}
    </p>

    
            {/* Resume Download Button */}
            {resume?.resume_url && (
              <div className="flex justify-center mb-8 animate-slide-up-delay">
                <button
                  onClick={handleDownloadResume}
                  className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border border-purple-400/30"
                >
                  <div className="flex items-center space-x-3">
                    <svg 
                      className="w-5 h-5 group-hover:scale-110 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <span>Download Resume</span>
                  </div>
                  
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10"></div>
                </button>
              </div>
            )}

            <div className="flex justify-center space-x-6 animate-slide-up-delay">
              {contact?.linkedin && (
                <Link href={contact.linkedin} target="_blank" className="group">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                    <Image
                      src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>LinkedIn</span>
                  </div>
                </Link>
              )}
              
              {contact?.github && (
                <Link href={contact.github} target="_blank" className="group">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                    <Image
                      src="https://www.google.com/s2/favicons?domain=github.com&sz=128"
                      alt="GitHub"
                      width={20}
                      height={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>GitHub</span>
                  </div>
                </Link>
              )}

              {contact?.other_links && contact.other_links.map((link: ContactLink) => (
                <Link key={link.id} href={link.url} target="_blank" className="group">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                    <Image
                      src={link.logo_url || `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=128`}
                      alt={link.name}
                      width={20}
                      height={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>{link.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* Education Section */}
{about?.education && about.education.length > 0 && (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Education
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {about.education.map((edu: any, index: number) => (
          <div 
            key={edu.id}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-purple-400/30 group animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center mb-4">
              {edu.logo && (
                <Image
                  src={edu.logo}
                  alt={edu.institution}
                  width={50}
                  height={50}
                  className="rounded-lg mr-4 group-hover:scale-110 transition-transform"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {edu.degree}
                </h3>
                <p className="text-purple-300">{edu.institution}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-gray-300 mb-4">
              <p className="flex justify-between">
                <span>Duration:</span>
                <span>{edu.startYear} - {edu.pursuing ? 'Present' : edu.endYear}</span>
              </p>
              <p className="flex justify-between">
                <span>Grade:</span>
                <span className="text-green-400">{edu.grade}/{edu.gradeScale}</span>
              </p>
              <p className="flex justify-between">
                <span>Level:</span>
                <span className="text-blue-400">{edu.level}</span>
              </p>
            </div>

            {/* Visit Website Button */}
            {edu.domain && (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    // Ensure the domain has proper protocol
                    const domainUrl = edu.domain.startsWith('http') 
                      ? edu.domain 
                      : `https://${edu.domain}`;
                    window.open(domainUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:scale-[1.02] group/btn"
                >
                  <span className="flex items-center justify-center gap-2">
                    Visit Website
                    <svg 
                      className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
)}

        {/* Experience Section - Only show if experience exists */}
        {about?.experience && about.experience.length > 0 && (
          <section className="py-20 px-4 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Experience
              </h2>
              
              <div className="space-y-8">
                {about.experience.map((exp: any, index: number) => (
                  <div 
                    key={exp.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-purple-400/30 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start mb-4">
                      {exp.logo && (
                        <Image
                          src={exp.logo}
                          alt={exp.company}
                          width={60}
                          height={60}
                          className="rounded-lg mr-6 group-hover:scale-110 transition-transform"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {exp.title}
                            </h3>
                            {exp.companyUrl ? (
                              <Link href={exp.companyUrl} target="_blank" className="text-xl text-purple-300 hover:text-purple-200 transition-colors">
                                {exp.company} ↗
                              </Link>
                            ) : (
                              <p className="text-xl text-purple-300">{exp.company}</p>
                            )}
                          </div>
                          <span className="text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full text-sm">
                            {exp.start} - {exp.present ? 'Present' : exp.end}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">{exp.description}</p>
                        
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill: string) => (
                              <span 
                                key={skill}
                                className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-700/50"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Skills
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Technical Skills */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
                  <h3 className="text-2xl font-semibold mb-6 text-center text-purple-300">Technical Skills</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {skills.technical?.map((skill: any) => (
                      <div 
                        key={skill.id}
                        className="flex items-center space-x-3 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 group"
                      >
                        {skill.logo_url && (
                          <Image
                            src={skill.logo_url}
                            alt={skill.name}
                            width={24}
                            height={24}
                            className="group-hover:scale-125 transition-transform duration-300"
                          />
                        )}
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {skill.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
                  <h3 className="text-2xl font-semibold mb-6 text-center text-pink-300">Soft Skills</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {skills.soft?.map((skill: string, index: number) => (
                      <div 
                        key={skill}
                        className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 text-center border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 group"
                      >
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {projects?.projects && projects.projects.length > 0 && (
          <section className="py-20 px-4 bg-white/5">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Projects
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
                {projects.projects.map((project: any, index: number) => {
                  const video = project.media?.find((m: any) => m.type === "video");
                  const images = project.media?.filter((m: any) => m.type === "image") || [];
                  const deployment = project.media?.find((m: any) => m.type === "deployment");

                  return (
                    <div
                      key={project.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 group hover:scale-105 animate-fade-in-up flex flex-col"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Media Section */}
                      <div className="relative h-48 overflow-hidden rounded-t-xl">
                        {video ? (
                          (() => {
                            const isYouTube =
                              video.url.includes("youtube.com") || video.url.includes("youtu.be");
                            if (isYouTube) {
                              const embedUrl = video.url
                                .replace("watch?v=", "embed/")
                                .replace("youtu.be/", "youtube.com/embed/");
                              return (
                                <div className="relative w-full h-0 pb-[56.25%]">
                                  <iframe
                                    src={embedUrl}
                                    title={project.title}
                                    allowFullScreen
                                    className="absolute top-0 left-0 w-full h-full rounded-t-xl"
                                  ></iframe>
                                </div>
                              );
                            } else {
                              return (
                                <div className="relative w-full h-full bg-black flex items-center justify-center">
                                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"></div>
                                  <div className="relative z-10 text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                                      <span className="text-2xl">🎬</span>
                                    </div>
                                    <p className="text-white text-sm">Video Available</p>
                                  </div>
                                </div>
                              );
                            }
                          })()
                        ) : images.length > 0 ? (
                          images.length === 1 ? (
                            <Image
                              src={images[0].url}
                              alt={project.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <Slider
                              dots
                              infinite
                              speed={500}
                              slidesToShow={1}
                              slidesToScroll={1}
                              arrows={false}
                              autoplay
                              autoplaySpeed={4000}
                            >
                              {images.map((img: any, i: number) => (
                                <div key={i} className="relative h-48">
                                  <Image
                                    src={img.url}
                                    alt={`${project.title} - image ${i + 1}`}
                                    fill
                                    className="object-cover rounded-t-xl"
                                  />
                                </div>
                              ))}
                            </Slider>
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <span className="text-4xl">🚀</span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-purple-300 text-sm mb-3">Role: {project.role}</p>
                        <p className="text-gray-300 text-sm mb-4 flex-1">{project.overview}</p>

                        {/* Process & Results */}
                        <div className="space-y-3 mb-4">
                          {project.process && (
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">Process:</h4>
                              <p className="text-gray-300 text-xs line-clamp-2">{project.process}</p>
                            </div>
                          )}
                          {project.results && (
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">Results:</h4>
                              <p className="text-gray-300 text-xs line-clamp-2">{project.results}</p>
                            </div>
                          )}
                        </div>

                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-white text-sm font-semibold mb-2">Tech Stack:</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.techStack.slice(0, 6).map((tech: any, techIndex: number) => (
                                <div
                                  key={techIndex}
                                  className="flex items-center space-x-1 bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs border border-purple-700/50"
                                >
                                  {tech.logo_url && (
                                    <Image
                                      src={tech.logo_url}
                                      alt={tech.name}
                                      width={12}
                                      height={12}
                                      className="rounded-sm"
                                    />
                                  )}
                                  <span>{tech.name}</span>
                                </div>
                              ))}
                              {project.techStack.length > 6 && (
                                <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs border border-purple-700/50">
                                  +{project.techStack.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {(project.repoLink || deployment) && (
                          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
                            
                            {/* Repository Link */}
                            {project.repoLink && (
                              <Link
                                href={project.repoLink}
                                target="_blank"
                                className="inline-flex items-center justify-between w-full text-purple-400 hover:text-purple-300 transition-colors text-sm group/link"
                              >
                                <span>View Repository</span>
                                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                              </Link>
                            )}

                            {/* Deployed/Live Demo Link */}
                            {deployment && (
                              <Link
                                href={deployment.url}
                                target="_blank"
                                className="inline-flex items-center justify-between w-full text-green-400 hover:text-green-300 transition-colors text-sm group/link"
                              >
                                <span>Live Demo</span>
                                <span className="transform group-hover/link:translate-x-1 transition-transform">🚀</span>
                              </Link>
                            )}

                            {/* Video Link (if no video embedded but video exists) */}
                            {video && !video.url.includes("youtube.com") && !video.url.includes("youtu.be") && (
                              <Link
                                href={video.url}
                                target="_blank"
                                className="inline-flex items-center justify-between w-full text-red-400 hover:text-red-300 transition-colors text-sm group/link"
                              >
                                <span>Watch Video</span>
                                <span className="transform group-hover/link:translate-x-1 transition-transform">🎬</span>
                              </Link>
                            )}
                            
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Languages & Interests Section */}
        {(langint?.language || langint?.interest) && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Languages */}
                {langint?.language && langint.language.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
                    <h3 className="text-2xl font-semibold mb-6 text-center text-purple-300">Languages</h3>
                    <div className="space-y-4">
                      {langint.language.map((lang: any) => {
                        const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"]
                        const starCount = proficiencyLevels.indexOf(lang.proficiency) + 1
                        
                        return (
                          <div key={lang.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                            <span className="text-gray-300">{lang.name}</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${
                                      i < starCount 
                                        ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' 
                                        : 'bg-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-purple-300 text-sm min-w-[80px] text-right">
                                {lang.proficiency}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {langint?.interest && langint.interest.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
                    <h3 className="text-2xl font-semibold mb-6 text-center text-pink-300">Interests</h3>
                    <div className="space-y-3">
                      {langint.interest.map((interest: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 group">
                          <div className="w-2 h-2 bg-pink-400 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                          <span className="text-gray-300 group-hover:text-white transition-colors">
                            {interest}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center space-x-8 mb-6 flex-wrap">
              {contact?.email && (
                <Link href={`mailto:${contact.email}`} className="text-gray-400 hover:text-white transition-colors">
                  ✉️ {contact.email}
                </Link>
              )}
              {contact?.phone && (
                <span className="text-gray-400">📞 {contact.phone}</span>
              )}
              {contact?.address && (
                <span className="text-gray-400">📍 {contact.address}</span>
              )}
            </div>
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} {profile.full_name}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}