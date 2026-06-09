import api from "../axiosConfig";
import type { UserProfile } from "../../types";

// El backend retorna { token, email } — luego el contexto llama getMyProfile para obtener el user completo
export interface LoginResponse {
  token: string;
  email: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await api.post("/auth/register", { name, email, password });
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/auth/profile");
  return res.data;
}
