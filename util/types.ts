// types.ts
export interface EducationEntry {
  id: string;
  level: string;
  degree: string;
  institution: string;
  domain: string;
  logo: string;
  startYear: string;
  endYear: string;
  pursuing: boolean;
  grade: string;
  gradeScale: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  companyUrl: string;
  start: string;
  end: string;
  present: boolean;
  skills: string[];
  logo: string;
  offerLetter: string;
  description: string;
}

export interface SchoolSearchResult {
  'School Name': string;
  rank: number;
  owner_ship: string;
}

export interface CompanySearchResult {
  Company_name: string;
  Description: string;
}

// Updated CloudinaryUploadResult to handle Cloudinary's response format
export interface CloudinaryUploadResult {
  event: string;
  info?: {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    resource_type?: string;
    bytes?: number;
    original_filename?: string;
    [key: string]: any;
  };
}
// types/cloudinary.d.ts
export interface CloudinaryUploadResultInfo {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  bytes?: number;
  original_filename?: string;
  [key: string]: any;
}

// Type guard to check if info is an object with secure_url
export function isCloudinaryInfoObject(info: unknown): info is { secure_url: string } {
  return (
    typeof info === 'object' &&
    info !== null &&
    'secure_url' in info &&
    typeof (info as any).secure_url === 'string'
  );
}

// Helper function to safely extract secure_url from Cloudinary results
export function getSecureUrlFromCloudinaryResult(results: CloudinaryUploadResult): string | null {
  if (!results.info) return null;
  
  if (typeof results.info === 'string') {
    try {
      // If info is a string, try to parse it as JSON
      const parsedInfo = JSON.parse(results.info);
      return parsedInfo.secure_url || null;
    } catch (error) {
      console.error('Error parsing Cloudinary info string:', error);
      return null;
    }
  } else if (isCloudinaryInfoObject(results.info)) {
    // If info is already an object with secure_url
    return results.info.secure_url;
  }
  
  return null;
}
// -----------------------------
// Contact Form Types
// -----------------------------

/**
 * Represents a single social or external link in the contact form.
 */
export interface OtherLink {
  id: string;
  name: string;
  url: string;
}

/**
 * Represents the user's contact data stored in the Supabase `contact` table.
 */
export interface ContactData {
  auth_user_id: string;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  phone: string | null;
  address: string | null;
  other_links: OtherLink[] | null;
  updated_at: string; // ISO timestamp
}

/**
 * Country code entry for dropdown selection.
 */
export interface CountryCode {
  code: string;
  flag: string;
  country: string;
}

/**
 * The internal state of the contact form component.
 */
export interface ContactFormState {
  email: string;
  linkedin: string;
  github: string;
  phone: string;
  countryCode: string;
  address: string;
  otherLinks: OtherLink[];
  input: string;
}

/**
 * Payload used when saving contact info to Supabase.
 */
export interface ContactPayload extends Omit<ContactData, "updated_at"> {
  updated_at: string;
}

/**
 * Props (if needed for testing or integration)
 */
export interface ContactFormProps {
  initialData?: ContactData | null;
}
// ---------------------------------------
// Profile Form Types for ProfileChatForm
// ---------------------------------------

/**
 * Represents a single form question used in ProfileChatForm.
 */
export interface ProfileQuestion {
  key:
    | "full_name"
    | "date_of_birth"
    | "gender"
    | "nationality"
    | "pronouns"
    | "locale"
    | "photo_url";

  question: string;
  placeholder?: string;
  type?: "text" | "date" | "image";
  options?: string[];
}

/**
 * Represents the user’s profile data as stored in the `user_profiles` table.
 */
export interface UserProfile {
  uid: string;
  full_name?: string | null;
  date_of_birth?: string | null; // Format: YYYY-MM-DD
  gender?: string | null;
  nationality?: string | null;
  pronouns?: string | null;
  locale?: string | null;
  photo_url?: string | null;
  updated_at?: string | null;
}

/**
 * The local state shape used inside the ProfileChatForm component.
 */
export interface ProfileFormState {
  step: number;
  answers: Record<string, string>;
  input: string;
  selectedDate: Date | null;
  done: boolean;
  loading: boolean;
  isEditing: boolean;
}

/**
 * Represents the shape of the response returned by Supabase when fetching or upserting the user profile.
 */
export interface SupabaseProfileResponse {
  data: UserProfile | null;
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  } | null;
}

/**
 * Represents the event payload returned by the Cloudinary upload widget on success.
 * (A safe, narrowed type compatible with next-cloudinary’s types.)
 */

// ---------------------------------------
// Project Form Types for ProjectForm
// ---------------------------------------

/**
 * A single technology item used in a project's tech stack.
 */
export interface TechItem {
  name: string;
  logo_url: string | null;
}

/**
 * Represents one media asset attached to a project (image, video, deployment, etc.)
 */
export interface ProjectMedia {
  id: string;
  type: "image" | "video" | "deployment";
  url: string;
}

/**
 * Represents one complete project entry.
 */
export interface ProjectItem {
  id: string;
  title: string;
  overview: string;
  role: string;
  techStack: TechItem[];
  process: string;
  results: string;
  media: ProjectMedia[];
  repoLink: string;
}

/**
 * Represents the structure stored in Supabase "project" table.
 * The table has an "id" matching the user ID and an array of projects.
 */
export interface ProjectTable {
  id: string;
  projects: ProjectItem[] | null;
  updated_at: string;
}

/**
 * Represents the form-level state for ProjectForm.
 */
export interface ProjectFormState {
  step: number;
  saving: boolean;
  loading: boolean;
  done: boolean;
  input: string;
  projects: ProjectItem[];
  techSearchResults: TechItem[];
  activeTechSearchId: string | null;
  activeProjectId: string | null;
}

/**
 * Represents a project example (used for autofilling)
 */
export interface ProjectExample extends Omit<ProjectItem, "id"> {}

/**
 * Represents a basic question in the ProjectForm flow.
 */
export interface ProjectQuestion {
  key: "projects";
  title: string;
  type: "projects";
}

/**
 * Represents Cloudinary upload result (narrowed to used properties)
 */
export interface CloudinaryUploadInfo {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  bytes?: number;
  original_filename?: string;
  [key: string]: any;
}

/**
 * Represents the shape of data returned by Supabase when fetching/upserting the projects.
 */
export interface SupabaseProjectResponse {
  data: ProjectTable | null;
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  } | null;
}
// types.ts
// types.ts
export interface SoftSkill {
  name: string;
  category?: string;
}

export interface TechnicalSkill {
  searchResults: any;
  activeSearch: any;
  id: string;          // required when used in state
  name: string;
  category: string;
  logo_url?: string;
}

// For incoming data from Supabase or seed data
export interface RawTechnicalSkill {
  id?: string;         // optional because new/fetched skills might not have it
  name: string;
  category: string;
  logo_url?: string;
}

export interface SkillsData {
  auth_user_id: string;
  soft: string[] | null;
  technical: TechnicalSkill[] | null;
}

// Optional: Supabase row type
export interface SkillsRow {
  id: string;
  auth_user_id: string;
  soft: string[];
  technical: RawTechnicalSkill[]; // raw skills may not have IDs yet
}
