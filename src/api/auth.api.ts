import { http } from "./http";

export type AuthUser = { id: string; name: string; email: string };

export const register = (payload: { name: string; email: string; password: string }) =>
  http.post<{ token: string; user: AuthUser }>("/auth/register", payload).then((r) => r.data);

export const login = (payload: { email: string; password: string }) =>
  http.post<{ token: string; user: AuthUser }>("/auth/login", payload).then((r) => r.data);

export const me = () =>
  http.get<{ user: AuthUser }>("/auth/me").then((r) => r.data);
