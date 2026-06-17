import { cookies } from "next/headers";

export const SESSION_COOKIE = "qm_admin_session";
export const SESSION_VALUE = "authenticated";

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const val = cookieStore.get(SESSION_COOKIE)?.value;
  return val === SESSION_VALUE;
}
