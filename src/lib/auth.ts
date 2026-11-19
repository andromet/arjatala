export interface AppUser {
  id: string;
  nim: string;
  full_name: string;
  role: "user" | "admin";
}

const SESSION_KEY = "arjatala_user_session";

export function getSessionUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: AppUser) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("arjatala-auth-change"));
}

export function clearSessionUser() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("arjatala-auth-change"));
}