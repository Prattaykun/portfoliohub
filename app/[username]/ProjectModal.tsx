// app/[username]/ProjectModal.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Slider from "react-slick";
import { Project } from "./portfolio";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}


// Custom arrow components for the slider
const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className}`}
      style={{
        ...style,
        display: "block",
        right: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 100,
      }}
      onClick={onClick}
    >
      {/* <div className="w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-black/30 hover:border-white/20 transition-all duration-300 group">
        <svg className="w-6 h-6 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div> */}
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} `}
      style={{
        ...style,
        display: "block",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 100,
      }}
      onClick={onClick}
    >
      {/* <div className="w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-black/30 hover:border-white/20 transition-all duration-300 group">
        <svg className="w-6 h-6 text-white/90 group-hover:text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div> */}
    </div>
  );
};

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const params = useParams();
  const username = params.username as string;
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/${username}/project/${project.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const videos = project.media?.filter((m: any) => m.type === "video") || [];
  const images = project.media?.filter((m: any) => m.type === "image") || [];
  const deployment = project.media?.find((m: any) => m.type === "deployment");

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    // autoplay: true,
    // autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots: any) => (
      <div>
        <ul className="flex justify-center space-x-2 mt-4"> {dots} </ul>
      </div>
    ),
    customPaging: (i: number) => (
      <div className="w-3 h-3 bg-white/30 rounded-full hover:bg-white/50 transition-colors cursor-pointer"></div>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div 
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
            title="Copy link to project"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            )}

            {/* Tooltip */}
            {copied && (
              <span className="absolute top-12 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <svg className="w-5 h-5 text-red-400 group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 pt-16 md:p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:pt-10 font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {project.title}
            </h2>
            <p className="text-purple-300 text-lg">Role: {project.role}</p>
          </div>

          {/* Media Section */}
          <div className="mb-8 space-y-6">
            {/* Video Section */}
            {videos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
                  Video Demo
                </h3>
                <div className="relative rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2">
                  <Slider {...sliderSettings}>
                    {videos.map((video: any, i: number) => {
                      const isYouTube = video.url.includes("youtube.com") || video.url.includes("youtu.be");
                      const embedUrl = isYouTube
                        ? video.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                        : null;

                      return (
                        <div key={i} className="relative rounded-lg overflow-hidden">
                          {isYouTube ? (
                            <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden mb-4 border border-purple-500/20 bg-black/50">
                              <iframe
                                src={embedUrl}
                                title={`${project.title} - Video Demo ${i + 1}`}
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded-xl"
                              ></iframe>
                            </div>
                          ) : (
                            <div className="relative w-full h-56 sm:h-72 md:h-96 bg-black rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl"></div>
                              <div className="relative z-10 text-center">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                  <span className="text-3xl">🎬</span>
                                </div>
                                <p className="text-white text-lg mb-4">Video Available</p>
                                <Link
                                  href={video.url}
                                  target="_blank"
                                  className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg transition-all duration-300 border border-white/20"
                                >
                                  <span>Watch Video</span>
                                  <span>→</span>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Slider>
                </div>
              </div>
            )}

            {/* Images Section - Updated with modern styling */}
            {images.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
                  {videos.length > 0 ? 'Project Images' : 'Media Gallery'}
                </h3>
                {images.length === 1 ? (
                  <div className="relative w-full h-96 rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <a href={images[0].url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                      <Image
                        src={images[0].url}
                        alt={`${project.title} - Main Image`}
                        fill
                        className="object-cover rounded-xl hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      />
                    </a>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2">
                    <Slider {...sliderSettings}>
                      {images.map((img: any, i: number) => (
                        <div key={i} className="relative h-96 rounded-lg overflow-hidden">
                          <a href={img.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                            <Image
                              src={img.url}
                              alt={`${project.title} - image ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            />
                            {/* Gradient overlay for better text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                          </a>
                        </div>
                      ))}
                    </Slider>
                  </div>
                )}
              </div>
            )}

            {/* Fallback if no media */}
            {videos.length === 0 && images.length === 0 && (
              <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <span className="text-6xl">🚀</span>
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
              Overview
            </h3>
            <p className="text-gray-300 leading-relaxed">{project.overview}</p>
          </div>

          {/* Process */}
          {project.process && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
                Development Process
              </h3>
              <p className="text-gray-300 leading-relaxed">{project.process}</p>
            </div>
          )}

          {/* Results */}
          {project.results && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
                Results & Impact
              </h3>
              <p className="text-gray-300 leading-relaxed">{project.results}</p>
            </div>
          )}

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-purple-500/30 pb-2">
                Technology Stack
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {project.techStack.map((tech: any, techIndex: number) => (
                  <div
                    key={techIndex}
                    className="flex items-center space-x-3 bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-300 group border border-white/10"
                  >
                    {tech.logo_url && (
                      <Image
                        src={tech.logo_url}
                        alt={tech.name}
                        width={24}
                        height={24}
                        className="group-hover:scale-125 transition-transform duration-300"
                      />
                    )}
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(project.repoLink || deployment) && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Project Links</h3>
              <div className="flex flex-wrap gap-4">
                {project.repoLink && (
                  <Link
                    href={project.repoLink}
                    target="_blank"
                    className="flex items-center space-x-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <Image
                      src="https://www.google.com/s2/favicons?domain=github.com&sz=128"
                      alt="GitHub"
                      width={20}
                      height={20}
                    />
                    <span className="text-purple-300 group-hover:text-purple-200">View Repository</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}

                {deployment && (
                  <Link
                    href={deployment.url}
                    target="_blank"
                    className="flex items-center space-x-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="text-lg">🚀</span>
                    <span className="text-green-300 group-hover:text-green-200">Live Demo</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}

                {videos.length > 0 && videos.every((v: any) => !v.url.includes("youtube.com") && !v.url.includes("youtu.be")) && (
                  <Link
                    href={videos[0].url}
                    target="_blank"
                    className="flex items-center space-x-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="text-lg">🎬</span>
                    <span className="text-red-300 group-hover:text-red-200">Watch Video</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};