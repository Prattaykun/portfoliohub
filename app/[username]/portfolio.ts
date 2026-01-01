// app/[username]/portfolio.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export type MediaType = "image" | "video" | "deployment" | "link" | "text";

export interface MediaBase {
  id: string;
  type: MediaType;
  title?: string;
  description?: string;
}

/** Image media */
export interface ImageMedia extends MediaBase {
  type: "image";
  url: string;
  width?: number;
  height?: number;
  format?: string;
}

/** Video media (youtube/vimeo/direct link) */
export interface VideoMedia extends MediaBase {
  type: "video";
  url: string;
  thumbnail?: string;
}

/** Deployment / live demo */
export interface DeploymentMedia extends MediaBase {
  type: "deployment";
  url: string;
}

/** Generic link */
export interface LinkMedia extends MediaBase {
  type: "link";
  url: string;
  label?: string;
}

/** Text-based item — stored in DB currently in `url` field */
export interface TextMedia extends MediaBase {
  type: "text";
  url: string; // currently used for content; consider renaming to `content` later
}

/** Union of all media item shapes */
export type MediaItem = ImageMedia | VideoMedia | DeploymentMedia | LinkMedia | TextMedia;

/** Section grouping media items (this matches your jsonb[] structure) */
export interface MediaSection {
  id: string;
  name: string;
  items: MediaItem[];
}

// Type definitions (same as before)
export interface Education {
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
  domain?: string;
}

export interface Experience {
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

export interface AboutData {
  bio?: string;
  roles?: string[];
  education?: Education[];
  experience?: Experience[];
}

export interface Skill {
  id: string;
  name: string;
  logo_url?: string;
}

export interface CertificateMedia {
  url: string;
  format?: string;          // "pdf", "jpg", etc.
  public_id?: string;
  resource_type?: string;   // sometimes "image" even for pdf
}

export interface CertificateSkill {
  name: string;
  source: "soft" | "technical"; // where it came from
  category?: string;
  logo_url?: string;
}

export interface Certificate {
  name: string;
  organization?: string;
  issue_date?: string;          // ISO date string
  credential_id?: string;
  credential_url?: string;
  skills?: CertificateSkill[];
  media?: CertificateMedia[];
}

/* ----- SkillsData updated to include media sections ----- */
export interface SkillsData {
  technical?: Skill[];
  soft?: string[];
  certificates?: Certificate[];
  media?: MediaSection[]; // <-- this must be present
}


export interface ProjectMedia {
  type: "image" | "video" | "deployment";
  url: string;
}

export interface ProjectTech {
  name: string;
  logo_url?: string;
}

export interface Project {
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

export interface ProjectsData {
  projects: Project[];
}

export interface ContactLink {
  id: string;
  name: string;
  url: string;
  logo_url?: string;
}

export interface ContactData {
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  other_links?: ContactLink[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Beginner" | "Elementary" | "Intermediate" | "Advanced" | "Fluent" | "Native";
}

export interface LangIntData {
  language?: Language[];
  interest?: string[];
}

export interface ResumeData {
  resume_url?: string;
}

export interface ProfileData {
  uid: string;
  full_name: string;
  photo_url?: string;
}

export interface UserData {
  profile: ProfileData;
  about: AboutData | null;
  skills: SkillsData | null;
  projects: ProjectsData | null;
  contact: ContactData | null;
  langint: LangIntData | null;
  resume: ResumeData | null;
}

export async function fetchUserData(username: string): Promise<{ data: UserData | null; error: string | null }> {
  if (username === "testuser") {
    return {
      data: {
        profile: {
          uid: "mock-uid",
          full_name: "Test User",
          photo_url: "https://via.placeholder.com/150",
        },
        about: {
          bio: "This is a test bio",
          roles: ["Developer", "Designer"],
          education: [],
          experience: [],
        },
        skills: {
          technical: [],
          soft: [],
          certificates: [],
          media: [],
        },
        projects: {
          projects: [
            {
              id: "p1",
              title: "Very Long Project Title That Might Collapse With Icons In Mobile View",
              role: "Lead Developer",
              overview: "Overview of the project",
              techStack: [],
              media: [],
              repoLink: "https://github.com/test/repo",
            },
          ],
        },
        contact: {
          linkedin: "https://linkedin.com",
          github: "https://github.com",
          other_links: [],
        },
        langint: {
          language: [],
          interest: [],
        },
        resume: {
          resume_url: "https://example.com/resume.pdf",
        },
      },
      error: null,
    };
  }
  try {
    // Get user ID from username
    const { data: usernameData, error: usernameError } = await supabase
      .from("users_usernames")
      .select("auth_user_id")
      .ilike("username", username)
      .single();

    if (usernameError || !usernameData) {
      return { data: null, error: "User not found" };
    }

    // Fetch all user data in parallel
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
      return { data: null, error: "User profile not found" };
    }

    return {
      data: {
        profile,
        about,
        skills,
        projects,
        contact,
        langint,
        resume,
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching user data:", err);
    return { data: null, error: "Failed to load portfolio" };
  }
}