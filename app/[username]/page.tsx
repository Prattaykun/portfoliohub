// app/[username]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Particles from "@/components/particles";
import Image from "next/image";
import Link from "next/link";
import AnimatedName from "@/components/AnimatedName";
import TypingRoles from "@/components/TypingRoles";
import { ProjectModal } from "./ProjectModal";
import { PortfolioSections } from "./PortfolioSections";
import { fetchUserData, UserData, Project } from "./portfolio";
import "./portfolio.css";

export default function PortfolioPage({ initialData }: { initialData?: UserData | null }) {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const projectId = params.projectId ? decodeURIComponent(params.projectId as string) : null;
  const [userData, setUserData] = useState<UserData | null>(initialData || null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<Project | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchUserData(username);
      
      if (error || !data) {
        setError(error || "User not found");
        return;
      }
      
      setUserData(data);
    } catch (err) {
      setError("Failed to load portfolio");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (!initialData) {
      loadUserData();
    }
  }, [loadUserData, initialData]);

  useEffect(() => {
    if (userData && projectId) {
      const project = userData.projects?.projects.find((p) => p.id === projectId);
      if (project) {
        setExpandedProject(project);
      }
    }
    
    // Handle hash scrolling after data load
    if (userData && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Slight delay to ensure DOM is ready
    }
  }, [userData, projectId]);

  // detect mobile viewport on client and update state so we can conditionally avoid heavy visuals
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const activeDocType = userData?.resume?.active_document || 'resume';
  const targetUrl = activeDocType === 'cv'
    ? (userData?.resume?.cv_url || userData?.resume?.resume_url)
    : (userData?.resume?.resume_url || userData?.resume?.cv_url);
  
  const isCV = activeDocType === 'cv' && !!userData?.resume?.cv_url;
  const docLabel = isCV ? 'Download CV' : 'Download Resume';

  const handleDownloadDocument = useCallback(() => {
    if (targetUrl && userData?.profile?.full_name) {
      const link = document.createElement('a');
      link.href = targetUrl;
      const filePrefix = isCV ? 'Curriculum_Vitae' : 'Resume';
      link.download = `${filePrefix}_${userData.profile.full_name.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [targetUrl, isCV, userData]);

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

  const { profile, about, contact, resume } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Particles Background (disabled on small screens for performance) */}
      {!isMobile && (
        <Particles
          className="absolute inset-0 z-0 opacity-60 pointer-events-none"
          quantity={80}
        />
      )}

      {/* Project Modal */}
      <ProjectModal 
        project={expandedProject!}
        isOpen={!!expandedProject}
        onClose={() => setExpandedProject(null)}
      />

      {/* Main Content */}
      <div className="relative pt-30 z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20 portfolio-mobile-padding">
          <div className="max-w-6xl mx-auto text-center w-full">
            
            {/* Profile Photo */}
            <div className="flex justify-center items-center pb-12 mb-8 animate-fade-in">
              {profile.photo_url && (
                <div className="relative">
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name}
                    width={180}
                    height={180}
                    className="rounded-full border-4 border-purple-400 shadow-2xl shadow-purple-500/50 hover:scale-105 transition-transform duration-300 hover-lift w-[140px] sm:w-[160px] md:w-[180px] h-auto"
                  />
                  <div className="profile-photo-glow"></div>
                </div>
              )}
            </div>

            {/* Animated Name */}
            <div className="px-4 break-words">
              <AnimatedName name={profile.full_name} />
            </div>

            {/* Typing Roles */}
            {about?.roles && about.roles.length > 0 && (
              <div className="px-2 mt-2">
                <TypingRoles roles={about.roles} />
              </div>
            )}

            {/* Bio */}
            {about?.bio && (
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 px-3 leading-relaxed animate-fade-in-delay">
                {about.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10 animate-slide-up-delay px-4">
                {/* Active Document Download Button */}
                {targetUrl && (
                    <button
                      onClick={handleDownloadDocument}
                      className="group relative bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border border-purple-400/30 text-sm sm:text-base w-full md:w-auto"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 justify-center">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform"
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
                        <span>{docLabel}</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 -z-10"></div>
                    </button>
                )}

                {/* Ask PortAI Button */}
                <Link
                  href={`/${username}/chatbot`}
                  className="group relative bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/10 hover:border-white/30 text-sm sm:text-base flex items-center justify-center gap-2 w-full md:w-auto backdrop-blur-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform text-purple-300">
                        <path d="M12 8V4H8"/>
                        <rect width="16" height="12" x="4" y="8" rx="2"/>
                        <path d="M2 14h2"/>
                        <path d="M20 14h2"/>
                        <path d="M15 13v2"/>
                        <path d="M9 13v2"/>
                    </svg>
                    <span>Ask PortAI About Me</span>
                    <div className="absolute inset-0 rounded-xl bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </Link>
            </div>

            {/* Social Links */}
            {(contact?.linkedin || contact?.github || contact?.other_links?.length) && (
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2 animate-slide-up-delay">
                {contact?.linkedin && (
                  <Link href={contact.linkedin} target="_blank" className="group w-full xs:w-auto sm:w-auto sm:flex-1 max-w-[160px]">
                    <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                      <Image
                        src="https://www.google.com/s2/favicons?domain=linkedin.com&sz=128"
                        alt="LinkedIn"
                        width={20}
                        height={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="truncate">LinkedIn</span>
                    </div>
                  </Link>
                )}
                {contact?.github && (
                  <Link href={contact.github} target="_blank" className="group w-full xs:w-auto sm:w-auto sm:flex-1 max-w-[160px]">
                    <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                      <Image
                        src="https://www.google.com/s2/favicons?domain=github.com&sz=128"
                        alt="GitHub"
                        width={20}
                        height={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="truncate">GitHub</span>
                    </div>
                  </Link>
                )}
                {contact?.other_links?.map((link) => (
                  <Link key={link.id} href={link.url} target="_blank" className="group w-full xs:w-auto sm:w-auto sm:flex-1 max-w-[160px]">
                    <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                      <Image
                        src={
                          link.logo_url ||
                          `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=128`
                        }
                        alt={link.name}
                        width={20}
                        height={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="truncate">{link.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Portfolio Sections */}
        <PortfolioSections 
          userData={userData}
          onExpandProject={setExpandedProject}
          onDownloadResume={handleDownloadDocument}
        />
      </div>
    </div>
  );
}