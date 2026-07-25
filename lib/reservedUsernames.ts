// lib/reservedUsernames.ts

/**
 * List of reserved usernames that correspond to top-level app route folders,
 * auth system routes, or critical system path names.
 */
export const RESERVED_USERNAMES = new Set<string>([
  // Top-level folder names in app/
  'admin',
  'api',
  'auth',
  'dashboard',
  'offline',
  'open',
  'pwa-icons',
  'share-target',
  'well-known',
  '.well-known',

  // app/(forms) subfolder names
  'about-form',
  'contact-form',
  'media-form',
  'profile-form',
  'project-form',
  'skill-form',

  // Auth / system route names
  'callback',
  'reset-password',
  'login',
  'signup',
  'edit',
  'preview',
  'chatbot',
  'generate-cv',
  'generate-resume',
  'notifications',
  'process-signature',

  // Standard reserved keywords
  'user',
  'users',
  'profile',
  'profiles',
  'settings',
  'portfolio',
  'portfolios',
  'home',
  'root',
  'system',
  'administrator',
  'help',
  'support',
  'terms',
  'privacy',
  'about',
  'contact',
  'null',
  'undefined',
  'public',
  'static',
  'assets',
]);

/**
 * Checks if a given username is reserved.
 * Case-insensitive comparison. Also rejects names containing '#' or starting/ending with spaces.
 */
export function isReservedUsername(username: string): boolean {
  if (!username) return false;
  const clean = username.trim().toLowerCase();
  return RESERVED_USERNAMES.has(clean);
}

/**
 * Validates a username and returns a user-friendly error message if invalid,
 * or null if valid.
 */
export function getUsernameValidationError(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) {
    return 'Please enter a username.';
  }
  if (trimmed.includes('#')) {
    return 'Username cannot contain the "#" character.';
  }
  if (trimmed.includes('/')) {
    return 'Username cannot contain slashes.';
  }
  if (isReservedUsername(trimmed)) {
    return `"${trimmed}" is a reserved name and cannot be used as a username.`;
  }
  return null;
}
