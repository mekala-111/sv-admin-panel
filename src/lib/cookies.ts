// Shared cookie names for admin auth tokens.
// Kept in their own module (not auth.ts) so api.ts can read them without a circular import.
export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";
export const USER_COOKIE = "admin_user";
