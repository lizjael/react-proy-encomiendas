// src/api/endpoints/clientes.api.ts
import api from "../axiosConfig";
import type { Cliente, CreateClienteDto, UpdateClienteDto } from "../../types";

export async function getAllClientes(): Promise<Cliente[]> {
  const res = await api.get<Cliente[]>("/clientes");
  return res.data;
}

export async function getClienteById(id: number): Promise<Cliente> {
  const res = await api.get<Cliente>(`/clientes/${id}`);
  return res.data;
}

export async function createCliente(dto: CreateClienteDto): Promise<Cliente> {
  const res = await api.post<Cliente>("/clientes", dto);
  return res.data;
}

export async function updateCliente(
  id: number,
  dto: UpdateClienteDto,
): Promise<Cliente> {
  const res = await api.patch<Cliente>(`/clientes/${id}`, dto);
  return res.data;
}

export async function deleteCliente(id: number): Promise<void> {
  await api.delete(`/clientes/${id}`);
}
