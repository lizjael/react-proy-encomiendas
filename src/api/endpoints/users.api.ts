// src/api/endpoints/users.api.ts
import api from "../axiosConfig";
import type { UserProfile, UpdateProfileDto } from "../../types";
import type { CreateUserDto } from "../../types";

export async function getMyProfile(): Promise<UserProfile> {
  const res = await api.get<UserProfile>("/users/me");
  return res.data;
}

export async function updateMyProfile(
  dto: UpdateProfileDto,
): Promise<UserProfile> {
  const res = await api.patch<UserProfile>("/users/me/perfil", dto);
  return res.data;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const res = await api.get<UserProfile[]>("/users");
  return res.data;
}

export async function getUserById(id: number): Promise<UserProfile> {
  const res = await api.get<UserProfile>(`/users/${id}`);
  return res.data;
}

export async function updateUserProfile(
  id: number,
  dto: UpdateProfileDto,
): Promise<UserProfile> {
  const res = await api.patch<UserProfile>(`/users/${id}/perfil`, dto);
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function createUser(dto: CreateUserDto): Promise<UserProfile> {
  const res = await api.post<UserProfile>("/users", dto);
  return res.data;
}
