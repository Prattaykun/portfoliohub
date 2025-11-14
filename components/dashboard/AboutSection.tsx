"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type AnyObj = Record<string, any>;

export default function AboutSection({ user }: { user: any }) {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAboutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .eq("auth_user_id", user?.id)
        .single();

      if (error || !data) {
        router.push("/about-form");
        return;
      }

      setAboutData(data);
    } catch (err) {
      console.error("fetchAboutData error:", err);
      router.push("/about-form");
    } finally {
      setLoading(false);
    }
  };

  // Safe data parsing function (keeps your earlier behavior)
  const parseData = (data: any) => {
    if (!data) return [];

    if (Array.isArray(data)) return data;

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return [];
      }
    }

    if (typeof data === "object" && data !== null) return [data];

    return [];
  };

  // turn experience entry into normalized companies-with-roles shape:
  // { id, company, companyUrl, logo, roles: [ { id, title, start, end, present, description, skills, offerLetter, attachments, location } ] }
  const normalizeExperience = (raw: any[]): AnyObj[] => {
    if (!raw || raw.length === 0) return [];

    // If already companies (roles array present), clean and return
    const looksLikeCompanies = raw.every((r) => r && (Array.isArray(r.roles) || r.company));
    if (looksLikeCompanies) {
      return raw.map((r: any) => ({
        id: r.id ?? Math.random().toString(36).slice(2),
        company: r.company ?? r.companyName ?? "",
        companyUrl: r.companyUrl ?? r.company_url ?? "",
        logo: r.logo ?? "",
        roles:
          Array.isArray(r.roles) && r.roles.length > 0
            ? r.roles.map((role: any) => ({
                id: role.id ?? Math.random().toString(36).slice(2),
                title: role.title ?? role.name ?? "",
                start: role.start ?? role.from ?? "",
                end: role.end ?? role.to ?? "",
                present: !!role.present,
                description: role.description ?? "",
                skills: role.skills ?? role.skills ?? [],
                offerLetter: role.offerLetter ?? null,
                attachments: role.attachments ?? [],
                location: role.location ?? role.place ?? "",
              }))
            : // fallback to single role created from top-level props
              [
                {
                  id: Math.random().toString(36).slice(2),
                  title: r.title ?? "",
                  start: r.start ?? "",
                  end: r.end ?? "",
                  present: !!r.present,
                  description: r.description ?? "",
                  skills: r.skills ?? [],
                  offerLetter: r.offerLetter ?? null,
                  attachments: r.attachments ?? (r.offerLetter ? [r.offerLetter] : []),
                  location: r.location ?? "",
                },
              ],
      }));
    }

    // Fallback: treat each item as a single-role company
    return raw.map((r: any) => ({
      id: r.id ?? Math.random().toString(36).slice(2),
      company: r.company ?? r.companyName ?? r.company_url ?? r.title ?? "Company / Project",
      companyUrl: r.companyUrl ?? r.company_url ?? "",
      logo: r.logo ?? "",
      roles: [
        {
          id: Math.random().toString(36).slice(2),
          title: r.title ?? r.role ?? "",
          start: r.start ?? "",
          end: r.end ?? "",
          present: !!r.present,
          description: r.description ?? "",
          skills: r.skills ?? [],
          offerLetter: r.offerLetter ?? null,
          attachments: r.attachments ?? (r.offerLetter ? [r.offerLetter] : []),
          location: r.location ?? "",
        },
      ],
    }));
  };

  const educationData = parseData(aboutData?.education);
  const rawExperience = parseData(aboutData?.experience);
  const experienceData = normalizeExperience(rawExperience);
  const rolesData = parseData(aboutData?.roles);

  // Helpers
  const formatMonthYear = (monthStr?: string) => {
    if (!monthStr) return "";
    // expected input "YYYY-MM" or "YYYY-MM-DD"
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No about data found</p>
          <button
            onClick={() => router.push("/about-form")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add About Information
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">About & Experience</h2>
        <button onClick={() => router.push("/about-form")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Edit
        </button>
      </div>

      {/* Roles */}
      {rolesData && rolesData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Roles</h3>
          <div className="flex flex-wrap gap-2">
            {rolesData.map((role: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bio</h3>
        <p className="text-gray-700 leading-relaxed">{aboutData.bio || "No bio added yet."}</p>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Education</h3>
        {educationData.length > 0 ? (
          <div className="space-y-4">
            {educationData.map((edu: any, index: number) => (
              <div key={edu.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {edu.logo && (
                    <div className="flex-shrink-0">
                      <img
                        src={edu.logo}
                        alt={edu.institution}
                        className="w-12 h-12 rounded-lg object-contain border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{edu.degree || "No degree specified"}</h4>
                        <p className="text-gray-600 font-medium">{edu.institution || "No institution specified"}</p>
                      </div>
                      {edu.domain && (
                        <a
                          href={edu.domain.startsWith("http") ? edu.domain : `https://${edu.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm ml-2"
                        >
                          ↗
                        </a>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.pursuing ? "Present" : edu.endYear || "Present"}
                      </p>

                      {edu.grade && (
                        <p className="text-sm text-gray-600">
                          Grade: {edu.grade}/{edu.gradeScale || "10"}
                        </p>
                      )}

                      {edu.level && <p className="text-sm text-gray-500 capitalize">{edu.level.toLowerCase()}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No education information added yet.</p>
        )}
      </div>

      {/* Experience - LinkedIn style timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience</h3>

        {experienceData.length > 0 ? (
          <div className="space-y-6">
            {experienceData.map((company: AnyObj, cIndex: number) => (
              <div key={company.id || cIndex} className="relative border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-start">
                  {/* Left column: logo + company name */}
                  <div className="w-28 min-w-[7rem] flex-shrink-0">
                    <div className="flex flex-col items-start">
                      <div className="bg-white rounded-md p-1 border w-16 h-16 flex items-center justify-center overflow-hidden">
                        {company.logo ? (
                          // logo image
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={company.logo} alt={company.company} className="w-full h-full object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                        ) : (
                          // placeholder token
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">🏢</div>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-800 leading-none">{company.company || "Company"}</div>
                        <div className="text-xs text-gray-500 mt-1">{/* optional company level summary */}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right column: timeline and roles */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* timeline gutter (dots + line) column - md sized */}
                      <div className="hidden md:block md:col-span-1 relative">
                        {/* vertical line covering full roles height; we render per-company line later */}
                      </div>

                      <div className="md:col-span-11">
                        {/* Company header row on top (company duration aggregated) */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600">
                              {/* optionally compute aggregated duration across roles */}
                              {(() => {
                                // compute earliest start and latest end/present
                                const starts = company.roles?.map((r: AnyObj) => r.start).filter(Boolean) || [];
                                const ends = company.roles?.map((r: AnyObj) => (r.present ? null : r.end)).filter(Boolean) || [];
                                const aggStart = starts.length ? starts.sort()[0] : "";
                                const aggEnd =
                                  company.roles?.some((r: AnyObj) => r.present) || !ends.length ? "Present" : ends.sort().reverse()[0];
                                return `${formatMonthYear(aggStart)} — ${aggEnd === "Present" ? "Present" : formatMonthYear(aggEnd)}`;
                              })()}
                            </div>
                          </div>

                          <div className="text-sm text-gray-500">{/* place for company metadata */}</div>
                        </div>

                        {/* Roles as timeline items */}
                        <div className="relative">
                          {/* vertical line for timeline on desktop */}
                          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-3" />

                          <div className="space-y-6 pl-0 md:pl-8">
                            {company.roles?.map((role: AnyObj, rIndex: number) => (
                              <div key={role.id || rIndex} className="flex gap-4 items-start">
                                {/* dot */}
                                <div className="hidden md:flex flex-col items-center w-8">
                                  <div className="w-3 h-3 rounded-full bg-gray-400 mt-1"></div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="text-md font-semibold text-gray-800">{role.title || "Role title"}</h4>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {formatMonthYear(role.start)} — {role.present ? "Present" : (role.end ? formatMonthYear(role.end) : "Present")}
                                        {" · "}
                                        <span className="text-gray-500">{computeDuration(role.start, role.end, role.present)}</span>
                                      </div>

                                      {role.location && <div className="text-sm text-gray-500">{role.location}</div>}
                                    </div>

                                    {/* small company-level or role-level link/attachment icon */}
                                    <div className="text-sm text-gray-500 ml-3 whitespace-nowrap" />
                                  </div>

                                  {role.description && <p className="text-gray-700 mt-2">{role.description}</p>}

                                  {/* skills / chips */}
                                  {role.skills && role.skills.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {role.skills.map((s: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* attachments / offer letter thumbnails */}
                                  {((role.attachments && role.attachments.length > 0) || role.offerLetter) && (
                                    <div className="mt-3 flex flex-wrap gap-3 items-center">
                                      {role.offerLetter && (
                                        <a href={role.offerLetter} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                                          View Offer →{" "}
                                        </a>
                                      )}
                                      {(role.attachments || []).map((att: string, ai: number) => (
                                        <a key={ai} href={att} target="_blank" rel="noreferrer" className="block w-24 h-14 rounded overflow-hidden border bg-gray-50">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={att} alt={`att-${ai}`} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No experience information added yet.</p>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-8 pt-6 border-t text-sm text-gray-500">Last updated: {new Date(aboutData.updated_at).toLocaleDateString()}</div>
    </div>
  );
}
