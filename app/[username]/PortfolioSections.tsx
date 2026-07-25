// app/[username]/PortfolioSections.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserData,
  Education,
  Experience,
  Project,
  ContactLink,
} from "./portfolio";
import MediaCard, { MediaItem as MediaItemType } from "./MediaCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface PortfolioSectionsProps {
  userData: UserData;
  onExpandProject: (project: Project) => void;
  onDownloadResume: () => void;
}

type MediaItem = MediaItemType;

type MediaSection = {
  id?: string;
  name?: string;
  items?: MediaItem[];
};

const SectionHeading = ({ 
  title, 
  id, 
  level = "h2", 
  align = "center", 
  colorClass 
}: { 
  title: string; 
  id: string; 
  level?: "h2" | "h3"; 
  align?: "center" | "left"; 
  colorClass?: string 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id={id} 
      className={`flex items-center ${align === 'center' ? 'justify-center' : 'justify-start'} gap-3 ${level === 'h2' ? 'mb-16' : 'mb-4'} scroll-mt-28 group relative rounded-lg p-2 transition-colors hover:bg-white/5`}
    >
      {level === "h2" ? (
        <h2 
          className={`text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer select-none ${colorClass || ''}`} 
          onClick={handleCopy}
        >
          {title}
        </h2>
      ) : (
        <h3 
          className={`text-2xl font-semibold cursor-pointer select-none ${colorClass || 'text-white'}`} 
          onClick={handleCopy}
        >
          {title}
        </h3>
      )}
      
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          aria-label="Copy section link"
        >
          {copied ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
        </button>
        {copied && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded shadow-lg pointer-events-none whitespace-nowrap animate-fade-in">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
};

export const PortfolioSections: React.FC<PortfolioSectionsProps> = ({
  userData,
  onExpandProject,
  onDownloadResume,
}) => {
  const { profile, about, skills, projects, contact, langint, resume } = userData;

  const [expandedMedia, setExpandedMedia] = useState<{ item: MediaItem; sectionName?: string } | null>(null);
  
  // State for expand/collapse functionality
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [expandedMediaSections, setExpandedMediaSections] = useState<Record<string, boolean>>({});

  const toggleMediaSection = (sectionKey: string) => {
    setExpandedMediaSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const isYouTube = (url?: string) => {
    if (!url) return false;
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const toYouTubeEmbed = (url: string) => {
    try {
      if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
      if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    } catch (e) {}
    return url;
  };

  const isPdf = (m: any) => {
    const fmt = String(m?.format || "").toLowerCase();
    const url = String(m?.url || "").toLowerCase();
    return fmt === "pdf" || url.endsWith(".pdf");
  };

  const isImage = (m: any) => {
    if (isPdf(m)) return false;
    const url = String(m?.url || "").toLowerCase();
    return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(url);
  };

  const fileLabel = (m: any) => {
    const fmt = String(m?.format || "").toUpperCase();
    if (fmt) return fmt;
    const url = String(m?.url || "");
    const last = url.split("/").pop() || "FILE";
    return last.length > 24 ? last.slice(0, 21) + "..." : last;
  };

  // Media modal (single item)
  const MediaModal: React.FC<{ item: MediaItem; sectionName?: string; onClose: () => void }> = ({ item, sectionName, onClose }) => {
    if (!item) return null;
    const type = String(item.type || "").toLowerCase();
    const title = item.title || "(untitled)";
    const url = item.url || "";
    const desc = item.description || "";

    return (
      <div className="fixed pt-30 inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-lg">
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute right-4 top-4 w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center border border-red-400/40" aria-label="Close">
            <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center pt-10 mb-6">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            {sectionName && <div className="text-sm text-gray-300 mt-1">{sectionName}</div>}
          </div>

          <div className="mb-6">
            {type === "image" && url && (
              <div className="relative w-full h-[46vh] rounded-xl overflow-hidden border border-white/6">
                <Image src={url} alt={title} fill className="object-contain" />
              </div>
            )}

            {type === "video" && url && isYouTube(url) && (
              <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden border border-white/6">
                <iframe src={toYouTubeEmbed(url)} title={title} allowFullScreen className="absolute inset-0 w-full h-full" />
              </div>
            )}

            {type === "video" && url && !isYouTube(url) && (
              <div className="w-full h-48 rounded-xl bg-black/60 flex items-center justify-center border border-white/6">
                <div className="text-center">
                  <div className="text-white mb-4">External Video</div>
                  <Link href={url} target="_blank" className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded">Watch Video ↗</Link>
                </div>
              </div>
            )}

            {type === "text" && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/8 text-gray-200 whitespace-pre-wrap max-h-[60vh] overflow-auto">
                {url}
              </div>
            )}

            {type === "link" && url && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/8">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{title}</div>
                  <div className="text-sm text-gray-300 truncate">{url}</div>
                  {desc && <div className="mt-2 text-sm text-gray-300">{desc}</div>}
                </div>
                <div className="flex-shrink-0">
                  <Link href={url} target="_blank" className="inline-flex items-center gap-2 bg-blue-600/80 px-4 py-2 rounded text-white">Open ↗</Link>
                </div>
              </div>
            )}
          </div>

          {desc && type !== "link" && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
              <div className="text-gray-300 whitespace-pre-wrap">{desc}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- Education  ----------
  const renderEducation = () => {
    if (!about?.education || about.education.length === 0) return null;
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Education" id="education" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {about.education.map((edu: Education, index: number) => (
              <div key={edu.id} className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-purple-400/30 group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center mb-4">
                  {edu.logo && <Image src={edu.logo} alt={edu.institution} width={50} height={50} className="rounded-lg mr-4 group-hover:scale-110 transition-transform" />}
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">{edu.degree}</h3>
                    <p className="text-purple-300">{edu.institution}</p>
                  </div>
                </div>
                <div className="space-y-2 text-gray-300 mb-4">
                  <p className="flex justify-between"><span>Duration:</span><span>{edu.startYear} - {edu.pursuing ? 'Present' : edu.endYear}</span></p>
                  <p className="flex justify-between"><span>Grade:</span><span className="text-green-400">{edu.grade}/{edu.gradeScale}</span></p>
                  <p className="flex justify-between"><span>Level:</span><span className="text-blue-400">{edu.level}</span></p>
                </div>
                {edu.domain && (
                  <div className="pt-4">
                    <button onClick={() => { const domainUrl = edu.domain!.startsWith('http') ? edu.domain : `https://${edu.domain}`; window.open(domainUrl, '_blank', 'noopener,noreferrer'); }} className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:scale-[1.02] group/btn">
                      <span className="flex cursor-pointer items-center justify-center gap-2">Visit Website<svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ---------- Experience (modern timeline UI, modified) ----------
  const formatMonthYear = (monthStr?: string) => {
    if (!monthStr) return "";
    try {
      const parts = monthStr.split("-");
      if (parts.length < 2) {
        const d = new Date(monthStr);
        if (isNaN(d.getTime())) return monthStr;
        return d.toLocaleString(undefined, { month: "short", year: "numeric" });
      }
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const d = new Date(year, month);
      return d.toLocaleString(undefined, { month: "short", year: "numeric" });
    } catch {
      return monthStr;
    }
  };

  const computeDuration = (start?: string, end?: string, present?: boolean) => {
    try {
      if (!start) return "";
      const s = new Date(start.length === 7 ? `${start}-01` : start);
      const e = present || !end ? new Date() : new Date(end.length === 7 ? `${end}-01` : end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
      const totalMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (totalMonths < 0) return "";
      const yrs = Math.floor(totalMonths / 12);
      const mos = totalMonths % 12;
      const parts = [];
      if (yrs > 0) parts.push(`${yrs} yr${yrs > 1 ? "s" : ""}`);
      if (mos > 0) parts.push(`${mos} mo${mos > 1 ? "s" : ""}`);
      return parts.join(" ");
    } catch {
      return "";
    }
  };

  const renderExperience = () => {
    if (!about?.experience || about.experience.length === 0) return null;

    // normalize to company + roles
    const normalized = about.experience.map((exp: any) => {
      if (Array.isArray(exp.roles)) return exp;
      return {
        id: exp.id ?? Math.random().toString(36).slice(2),
        company: exp.company ?? exp.companyName ?? exp.companyUrl ?? exp.title ?? "Company",
        companyUrl: exp.companyUrl ?? exp.company_url ?? "",
        logo: exp.logo ?? "",
        roles: [
          {
            id: exp.id ? `${exp.id}-role` : Math.random().toString(36).slice(2),
            title: exp.title ?? "Role",
            start: exp.start ?? "",
            end: exp.end ?? "",
            present: exp.present ?? false,
            description: exp.description ?? "",
            skills: exp.skills ?? [],
            attachments: exp.attachments ?? (exp.offerLetter ? [exp.offerLetter] : []),
            offerLetter: exp.offerLetter ?? null,
            location: exp.location ?? "",
          },
        ],
      };
    });

    return (
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-white/2">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Experience" id="experience" />

          <div className="space-y-8">
            {normalized.map((company: any, cIdx: number) => (
              <div key={company.id || cIdx} className="relative bg-white/6 rounded-2xl p-6 md:p-8 border border-white/8 hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div className="md:flex md:items-start md:gap-6">
                  {/* left: logo + company in uniform circular frame */}
                  <div className="md:w-36 flex-shrink-0 flex items-center md:items-start gap-4">
                    {company.logo ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 p-2 border border-white/15 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 backdrop-blur-sm group-hover:border-purple-400/40 transition-all duration-300">
                        <img
                          src={company.logo}
                          alt={company.company}
                          className="w-full h-full object-contain rounded-full p-0.5"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.parentElement!.innerHTML = `<div className="w-full h-full flex items-center justify-center text-xl md:text-2xl font-bold text-purple-300">${company.company ? company.company.charAt(0).toUpperCase() : '🏢'}</div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-white/10 border border-purple-400/20 shadow-md flex items-center justify-center text-xl md:text-2xl font-bold text-purple-300 flex-shrink-0">
                        {company.company ? company.company.charAt(0).toUpperCase() : "🏢"}
                      </div>
                    )}

                    <div className="hidden md:block">
                      <div className="text-sm font-semibold text-gray-200">{company.company}</div>
                      {company.companyUrl ? (
                        <a href={company.companyUrl.startsWith("http") ? company.companyUrl : `https://${company.companyUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:text-blue-200">
                          Visit ↗
                        </a>
                      ) : (
                        <div className="text-xs text-gray-400">No website</div>
                      )}
                    </div>
                  </div>

                  {/* right: roles & timeline */}
                  <div className="flex-1 mt-4 md:mt-0">
                    <div className="hidden md:block absolute left-[140px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

                    <div className="space-y-6">
                      {company.roles?.map((role: any, rIdx: number) => (
                        <div key={role.id || rIdx} className="md:flex md:items-start md:gap-6">
                          <div className="hidden md:flex flex-col items-center w-12">
                            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-lg" />
                            {rIdx < company.roles.length - 1 && <div className="flex-1 w-px bg-white/6 mt-2" />}
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <h3 className="text-lg md:text-xl font-semibold text-white hover:text-purple-300 transition-colors">{role.title}</h3>
                                <div className="text-sm text-gray-300 mt-1">
                                  <span>{formatMonthYear(role.start)}</span>
                                  {" — "}
                                  <span>{role.present ? "Present" : (role.end ? formatMonthYear(role.end) : "Present")}</span>
                                  {" · "}
                                  <span className="text-gray-400">{computeDuration(role.start, role.end, role.present)}</span>
                                </div>
                                {role.location && <div className="text-sm text-gray-400 mt-1">{role.location}</div>}
                              </div>

                              <div className="flex-shrink-0 ml-3 flex items-center gap-3">
                                {role.offerLetter && (
                                  <a href={role.offerLetter} target="_blank" rel="noopener noreferrer" className="text-sm bg-emerald-700/20 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600/30 hover:bg-emerald-700/30 transition">
                                    Offer
                                  </a>
                                )}
                              </div>
                            </div>

                            {role.description && (
                              <p className="text-gray-300 mt-3 leading-relaxed">{role.description}</p>
                            )}

                            {role.skills && role.skills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {role.skills.map((s: string, si: number) => (
                                  <span key={si} className="px-2 py-1 bg-white/6 text-gray-200 rounded-full text-xs border border-white/8">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {role.attachments && role.attachments.length > 0 && (
                              <div className="mt-4">
                                <div className="text-sm text-gray-400 mb-2">Attachments</div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {role.attachments.map((att: string, ai: number) => (
                                    <a key={ai} href={att} target="_blank" rel="noopener noreferrer" className="w-32 h-20 rounded overflow-hidden border border-white/8 block transition-transform hover:scale-105">
                                      <img src={att} alt={`attachment-${ai}`} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="md:hidden mt-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-400">{company.company}</div>
                        {company.companyUrl ? (
                          <a className="text-sm text-blue-300 hover:text-blue-200" href={company.companyUrl.startsWith("http") ? company.companyUrl : `https://${company.companyUrl}`} target="_blank" rel="noreferrer">↗ Website</a>
                        ) : (
                          <div className="text-xs text-gray-500">No website</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ---------- Skills (unchanged) ----------
  const renderSkills = () => {
    if (!skills) return null;
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Skills" id="skills" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white/10 rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
              <h3 className="text-2xl font-semibold mb-6 text-center text-purple-300">Technical Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {skills.technical?.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-3 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 group">
                    {skill.logo_url && <Image src={skill.logo_url} alt={skill.name} width={24} height={24} className="group-hover:scale-125 transition-transform duration-300" />}
                    <span className="text-gray-300 group-hover:text-white transition-colors">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
              <h3 className="text-2xl font-semibold mb-6 text-center text-pink-300">Soft Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {skills.soft?.map((skill: string) => (
                  <div key={skill} className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 text-center border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 group">
                    <span className="text-gray-300 group-hover:text-white transition-colors">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ---------- Certificates (unchanged) ----------
  const renderCertificates = () => {
    const certificates = skills?.certificates || [];
    if (!certificates || certificates.length === 0) return null;
    return (
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Certificates" id="certificates" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {certificates.map((cert: any, idx: number) => (
              <div key={`${cert.name}-${idx}`} className="bg-white/10 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-up flex flex-col" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">{cert.name || "Certificate"}</h3>
                    {cert.organization && <p className="text-purple-300 text-sm">{cert.organization}</p>}
                  </div>
                  {cert.issue_date && <span className="text-xs text-purple-200 bg-purple-900/40 px-2 py-1 rounded-full shrink-0">{new Date(cert.issue_date).toLocaleDateString()}</span>}
                </div>
                {(cert.credential_id || cert.credential_url) && <div className="text-sm text-gray-300 space-y-1 mb-4">{cert.credential_id && <div><span className="text-gray-400">ID: </span><span className="font-medium text-white">{cert.credential_id}</span></div>}{cert.credential_url && <div className="truncate"><Link href={cert.credential_url} target="_blank" className="text-blue-300 hover:text-blue-200 underline break-all">Verify Credential ↗</Link></div>}</div>}
                {Array.isArray(cert.skills) && cert.skills.length > 0 && <div className="mb-4"><div className="text-sm text-gray-300 mb-2">Related skills</div><div className="flex flex-wrap gap-2">{cert.skills.map((s: any, i: number) => <span key={`${s?.source || "skill"}-${s?.name || i}-${i}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gray-100 text-sm border border-white/10">{s?.logo_url && <Image src={s.logo_url} alt={s?.name || "skill"} width={16} height={16} className="rounded-sm" /> }<span className="font-medium">{s?.name || "Skill"}</span>{s?.source && <span className="text-[10px] uppercase tracking-wide text-gray-400">{s.source}</span>}</span>)}</div></div>}
                {Array.isArray(cert.media) && cert.media.length > 0 ? <div className="mt-auto"><div className="text-sm text-gray-300 mb-2">Attachments</div><div className="grid grid-cols-2 gap-3">{cert.media.map((m: any, i: number) => <div key={i} className="border rounded-md p-2 bg-white/5">{isPdf(m) ? <Link href={m?.url} target="_blank" className="block"><Image src="/pdf.png" alt={fileLabel(m)} width={400} height={300} className="w-full h-28 object-contain rounded bg-white" /></Link> : isImage(m) ? <Link href={m?.url} target="_blank" className="block"><Image src={m?.url} alt={fileLabel(m)} width={400} height={300} className="w-full h-28 object-cover rounded" /></Link> : <Link href={m?.url} target="_blank" className="flex items-center justify-center w-full h-28 rounded bg-white text-sm text-blue-700 underline">{fileLabel(m)}</Link>}</div>)}</div></div> : <div className="text-sm text-gray-400">No attachments.</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Ref for projects section to scroll to on collapse
  const projectsRef = React.useRef<HTMLElement>(null);

  // ---------- Projects (Using Framer Motion) ----------
  const renderProjects = () => {
    if (!projects?.projects || projects.projects.length === 0) return null;

    const visibleProjects = showAllProjects 
      ? projects.projects 
      : projects.projects.slice(0, 4);

    const hasMore = projects.projects.length > 4;

    const handleToggleProjects = () => {
      if (showAllProjects) {
        setShowAllProjects(false);
        // Scroll back to top of projects section smoothly
        setTimeout(() => {
          projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100); // slight delay to ensure state update processes, though layout shift is animated
      } else {
        setShowAllProjects(true);
      }
    };

    return (
      <section ref={projectsRef} className="py-20 px-4 bg-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Projects" id="projects" />
          
          <motion.div 
            layout 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr"
          >
            <AnimatePresence>
              {visibleProjects.map((project: Project, index: number) => {
                const video = project.media?.find((m: any) => m.type === "video");
                const images = project.media?.filter((m: any) => m.type === "image") || [];
                const deployment = project.media?.find((m: any) => m.type === "deployment");

                return (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onExpandProject(project)}
                    className="bg-white/10 rounded-xl border border-white/10 hover:border-purple-400/30 transition-colors duration-300 group hover:scale-[1.01] flex flex-col will-change-transform cursor-pointer"
                  >
                    <div
                      className="relative h-48 overflow-hidden rounded-t-xl cursor-pointer"
                      onClick={() => onExpandProject(project)}
                    >
                      {video ? (() => {
                          const isYT = isYouTube(String(video.url || ""));
                          if (isYT) {
                            const embedUrl = toYouTubeEmbed(String(video.url || ""));
                            return (
                              <div className="relative w-full h-0 pb-[56.25%]">
                                <iframe
                                  src={embedUrl}
                                  title={project.title}
                                  allowFullScreen
                                  className="absolute top-0 left-0 w-full h-full rounded-t-xl pointer-events-none"
                                />
                              </div>
                            );
                          }
                          return (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
                              <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                                  <span className="text-2xl">🎬</span>
                                </div>
                                <p className="text-white text-sm">Video Available</p>
                              </div>
                            </div>
                          );
                        })()
                      : images.length > 0
                      ? (
                        <Slider
                          dots
                          infinite
                          speed={500}
                          slidesToShow={1}
                          slidesToScroll={1}
                          autoplay
                          autoplaySpeed={4000}
                          arrows={false}
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
                      : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <span className="text-4xl">🚀</span>
                        </div>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">{project.title}</h3>
                      <p className="text-purple-300 text-sm mb-3">Role: {project.role}</p>
                      <p className="text-gray-300 text-sm mb-4 flex-1">{project.overview}</p>

                      <div className="space-y-3 mb-4">
                        {project.process && <div><h4 className="text-white text-sm font-semibold mb-1">Process:</h4><p className="text-gray-300 text-xs line-clamp-2">{project.process}</p></div>}
                        {project.results && <div><h4 className="text-white text-sm font-semibold mb-1">Results:</h4><p className="text-gray-300 text-xs line-clamp-2">{project.results}</p></div>}
                      </div>

                      {project.techStack && project.techStack.length > 0 && <div className="mb-4"><h4 className="text-white text-sm font-semibold mb-2">Tech Stack:</h4><div className="flex flex-wrap gap-2">{project.techStack.slice(0, 6).map((tech: any, techIndex: number) => <div key={techIndex} className="flex items-center space-x-1 bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs border border-purple-700/50">{tech.logo_url && <Image src={tech.logo_url} alt={tech.name} width={12} height={12} className="rounded-sm" />}<span>{tech.name}</span></div>)}{project.techStack.length > 6 && <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs border border-purple-700/50">+{project.techStack.length - 6} more</span>}</div></div>}

                      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-3">
                      {(project.repoLink || deployment) && <div className="flex flex-col gap-2">{project.repoLink && <Link href={project.repoLink} target="_blank" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-between w-full text-purple-400 hover:text-purple-300 transition-colors text-sm group/link"><span>View Repository</span><span className="transform group-hover/link:translate-x-1 transition-transform">→</span></Link>}{deployment && <Link href={deployment.url} target="_blank" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-between w-full text-green-400 hover:text-green-300 transition-colors text-sm group/link"><span>Live Demo</span><span className="transform group-hover/link:translate-x-1 transition-transform">🚀</span></Link>}{video && !String(video.url || "").includes("youtube.com") && !String(video.url || "").includes("youtu.be") && <Link href={String(video.url)} target="_blank" onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-between w-full text-red-400 hover:text-red-300 transition-colors text-sm group/link"><span>Watch Video</span><span className="transform group-hover/link:translate-x-1 transition-transform">🎬</span></Link>}</div>}
                        <button onClick={() => onExpandProject(project)} className="w-full py-2 cursor-pointer px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg text-purple-300 hover:text-purple-200 transition-all duration-300 hover:scale-[1.02] group/expand flex items-center justify-center gap-2 mt-2">
                          <span>Expand Details</span>
                          <svg className="w-4 h-4 group-hover/expand:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <motion.button
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleProjects}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-shadow cursor-pointer"
              >
                {showAllProjects ? "Show Less" : "View All Projects"}
              </motion.button>
            </div>
          )}
        </div>
      </section>
    );
  };

  // ---------- Media / Portfolio Sections (Using Framer Motion) ----------
  const renderMediaSections = () => {
    const mediaSections: MediaSection[] = (skills?.media as MediaSection[]) || [];

    // keep only sections that have at least one item
    const visibleSections = mediaSections.filter(
      (s) => Array.isArray(s.items) && s.items.length > 0
    );

    if (visibleSections.length === 0) return null;

    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-10">
            {visibleSections.map((section: MediaSection, sIdx: number) => {
              const fullItems: MediaItem[] = Array.isArray(section.items) ? section.items : [];
              const sectionId = section.id || String(sIdx);
              const isExpanded = expandedMediaSections[sectionId] || false;
              const displayedItems = isExpanded ? fullItems : fullItems.slice(0, 4);
              const hasMore = fullItems.length > 4;

              return (
                <div
                  key={sectionId}
                  className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
                >
                  <SectionHeading 
                    title={section.name || "Section"} 
                    id={section.name ? section.name.toLowerCase().replace(/\s+/g, '-') : sectionId} 
                    level="h3" 
                    align="left" 
                  />

                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {displayedItems.map((item) => (
                        <motion.div
                          layout
                          key={item.id || item.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="p-0"
                        >
                          <MediaCard
                            item={item}
                            sectionName={section.name}
                            onExpand={(it: any) =>
                              setExpandedMedia({ item: it, sectionName: section.name })
                            }
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {hasMore && (
                    <div className="flex justify-center mt-6">
                       <motion.button
                        layout
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleMediaSection(sectionId)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-medium transition-colors cursor-pointer"
                      >
                         {isExpanded ? "Show Less" : "View All"}
                       </motion.button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {expandedMedia && (
          <MediaModal
            item={expandedMedia.item}
            sectionName={expandedMedia.sectionName}
            onClose={() => setExpandedMedia(null)}
          />
        )}
      </section>
    );
  };

  // ---------- Languages & Interests (unchanged) ----------
  const renderLanguagesAndInterests = () => {
    if (!langint?.language && !langint?.interest) return null;
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {langint?.language && langint.language.length > 0 && (
              <div className="bg-white/10 rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
                <SectionHeading title="Languages" id="languages" level="h3" align="center" colorClass="text-purple-300" />
                <div className="space-y-4">
                  {langint.language.map((lang) => {
                    const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"];
                    const starCount = Math.max(0, Math.min(6, proficiencyLevels.indexOf(lang.proficiency) + 1));
                    return (
                      <div key={lang.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                        <span className="text-gray-300">{lang.name}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} className={`w-3 h-3 rounded-full ${i < starCount ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-purple-300 text-sm min-w-[80px] text-right">{lang.proficiency}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {langint?.interest && langint.interest.length > 0 && (
              <div className="bg-white/10 rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
                <SectionHeading title="Interests" id="interests" level="h3" align="center" colorClass="text-pink-300" />
                <div className="space-y-3">
                  {langint.interest.map((interest: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-2 h-2 bg-pink-400 rounded-full group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-gray-300 group-hover:text-white transition-colors">{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // ---------- Footer ----------
  const renderFooter = () => (
    <footer className="py-12 px-4 border-t border-white/10">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center space-x-8 mb-6 flex-wrap">
          {contact?.email && <Link href={`mailto:${contact.email}`} className="text-gray-400 hover:text-white transition-colors">✉️ {contact.email}</Link>}
          {contact?.phone && <span className="text-gray-400">📞 {contact.phone}</span>}
          {contact?.address && <span className="text-gray-400">📍 {contact.address}</span>}
        </div>
        <p className="text-gray-500">&copy; {new Date().getFullYear()} {profile.full_name}. All rights reserved.</p>
      </div>
    </footer>
  );

  return (
    <>
      {renderEducation()}
      {renderExperience()}
      {renderSkills()}
      {renderCertificates()}
      {renderProjects()}
      {renderMediaSections()}
      {renderLanguagesAndInterests()}
      {renderFooter()}
    </>
  );
};

export default PortfolioSections;
