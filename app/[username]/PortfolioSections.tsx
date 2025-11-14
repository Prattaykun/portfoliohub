// app/[username]/PortfolioSections.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
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

export const PortfolioSections: React.FC<PortfolioSectionsProps> = ({
  userData,
  onExpandProject,
  onDownloadResume,
}) => {
  const { profile, about, skills, projects, contact, langint, resume } = userData;

  const [expandedMedia, setExpandedMedia] = useState<{ item: MediaItem; sectionName?: string } | null>(null);

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

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            {sectionName && <div className="text-sm text-gray-300 mt-1">{sectionName}</div>}
            <div className="text-xs text-gray-400 mt-2 uppercase">{type}</div>
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

  // ---------- Education (kept same as your version) ----------
  const renderEducation = () => {
    if (!about?.education || about.education.length === 0) return null;
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Education
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {about.education.map((edu: Education, index: number) => (
              <div key={edu.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-purple-400/30 group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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
                      <span className="flex items-center justify-center gap-2">Visit Website<svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span>
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

  // ---------- Experience (unchanged) ----------
  const renderExperience = () => {
    if (!about?.experience || about.experience.length === 0) return null;
    return (
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Experience</h2>
          <div className="space-y-8">
            {about.experience.map((exp: Experience, index: number) => (
              <div key={exp.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-purple-400/30 group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start mb-4">
                  {exp.logo && <Image src={exp.logo} alt={exp.company} width={60} height={60} className="rounded-lg mr-6 group-hover:scale-110 transition-transform" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors">{exp.title}</h3>
                        {exp.companyUrl ? <Link href={exp.companyUrl} target="_blank" className="text-xl text-purple-300 hover:text-purple-200 transition-colors">{exp.company} ↗</Link> : <p className="text-xl text-purple-300">{exp.company}</p>}
                      </div>
                      <span className="text-purple-300 bg-purple-900/50 px-3 py-1 rounded-full text-sm">{exp.start} - {exp.present ? 'Present' : exp.end}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{exp.description}</p>
                    {exp.skills && exp.skills.length > 0 && <div className="flex flex-wrap gap-2">{exp.skills.map((skill: string) => <span key={skill} className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-700/50">{skill}</span>)}</div>}
                  </div>
                </div>
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
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Skills</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
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
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {certificates.map((cert: any, idx: number) => (
              <div key={`${cert.name}-${idx}`} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-up flex flex-col" style={{ animationDelay: `${idx * 80}ms` }}>
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

  // ---------- Projects (unchanged) ----------
  const renderProjects = () => {
    if (!projects?.projects || projects.projects.length === 0) return null;
    return (
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
            {projects.projects.map((project: Project, index: number) => {
              const video = project.media?.find((m: any) => m.type === "video");
              const images = project.media?.filter((m: any) => m.type === "image") || [];
              const deployment = project.media?.find((m: any) => m.type === "deployment");
              return (
                <div key={project.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 group hover:scale-105 animate-fade-in-up flex flex-col" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    {video ? (() => {
                      const isYT = isYouTube(String(video.url || ""));
                      if (isYT) {
                        const embedUrl = toYouTubeEmbed(String(video.url || ""));
                        return <div className="relative w-full h-0 pb-[56.25%]"><iframe src={embedUrl} title={project.title} allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-t-xl" /></div>;
                      }
                      return <div className="relative w-full h-full bg-black flex items-center justify-center"><div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50"></div><div className="relative z-10 text-center"><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto"><span className="text-2xl">🎬</span></div><p className="text-white text-sm">Video Available</p></div></div>;
                    })() : images.length > 0 ? (images.length === 1 ? <Image src={images[0].url} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" /> : <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1} arrows={false} autoplay autoplaySpeed={4000}>{images.map((img: any, i: number) => <div key={i} className="relative h-48"><Image src={img.url} alt={`${project.title} - image ${i + 1}`} fill className="object-cover rounded-t-xl" /></div>)}</Slider>) : <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"><span className="text-4xl">🚀</span></div>}
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
                      {(project.repoLink || deployment) && <div className="flex flex-col gap-2">{project.repoLink && <Link href={project.repoLink} target="_blank" className="inline-flex items-center justify-between w-full text-purple-400 hover:text-purple-300 transition-colors text-sm group/link"><span>View Repository</span><span className="transform group-hover/link:translate-x-1 transition-transform">→</span></Link>}{deployment && <Link href={deployment.url} target="_blank" className="inline-flex items-center justify-between w-full text-green-400 hover:text-green-300 transition-colors text-sm group/link"><span>Live Demo</span><span className="transform group-hover/link:translate-x-1 transition-transform">🚀</span></Link>}{video && !String(video.url || "").includes("youtube.com") && !String(video.url || "").includes("youtu.be") && <Link href={String(video.url)} target="_blank" className="inline-flex items-center justify-between w-full text-red-400 hover:text-red-300 transition-colors text-sm group/link"><span>Watch Video</span><span className="transform group-hover/link:translate-x-1 transition-transform">🎬</span></Link>}</div>}
                      <button onClick={() => onExpandProject(project)} className="w-full py-2 px-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg text-purple-300 hover:text-purple-200 transition-all duration-300 hover:scale-[1.02] group/expand flex items-center justify-center gap-2 mt-2">
                        <span>Expand Details</span>
                        <svg className="w-4 h-4 group-hover/expand:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  // ---------- Media / Portfolio Sections (card grid) ----------
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
            const items: MediaItem[] = Array.isArray(section.items) ? section.items : [];
            return (
              <div
                key={section.id || sIdx}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-white">{section.name || "Section"}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item.id || item.title} className="p-0">
                      <MediaCard
                        item={item}
                        sectionName={section.name}
                        onExpand={(it: any) =>
                          setExpandedMedia({ item: it, sectionName: section.name })
                        }
                      />
                    </div>
                  ))}
                </div>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-left">
                <h3 className="text-2xl font-semibold mb-6 text-center text-purple-300">Languages</h3>
                <div className="space-y-4">
                  {langint.language.map((lang) => {
                    const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"];
                    const starCount = Math.max(0, Math.min(5, proficiencyLevels.indexOf(lang.proficiency) + 1));
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 animate-fade-in-right">
                <h3 className="text-2xl font-semibold mb-6 text-center text-pink-300">Interests</h3>
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
