// src/types/index.ts
export type Role = "user" | "admin" | "super_admin";

export type EstadoEntrega =
  | "PENDIENTE"
  | "EN_TRANSITO"
  | "ENTREGADO"
  | "CANCELADO";

export type EstadoPago = "PENDIENTE" | "COMPLETADO" | "RECHAZADO" | "ANULADO";

export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "QR"
  | "DEPOSITO_BANCARIO"
  | "MERCADO_PAGO"
  | "YAPE"
  | "PLIN";

export interface UserActive {
  sub: number;
  email: string;
  role: Role;
  name: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  nombres?: string;
  apellidos?: string;
  ci?: string;
  telefono?: string;
  horaEntrada?: string;
  horaSalida?: string;
  turno?: string;
  fechaContratacion?: string;
  idSucursal?: number;
  sucursal?: Sucursal; // ✅ objeto completo para mostrar nombre/ciudad
  estado: string;
  creadoEn: string;
  eliminadoEn?: string | null;
}

export interface AuthResponse {
  token: string;
  user: UserActive;
}

export interface Sucursal {
  idSucursal: number;
  nombre: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  estado: string;
  eliminadoEn?: string | null;
}

export interface Cliente {
  idCliente: number;
  tipoCliente:
    | "NATURAL"
    | "JURIDICO"
    | "persona"
    | "empresa"
    | "EMPRESARIAL"
    | string;
  nombreRazonSocial: string;
  ci?: string;
  nit?: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
  eliminadoEn?: string | null;
}

export interface Consignatario {
  idConsignatario: number;
  nombres: string;
  telefono: string;
  creadoEn: string;
  eliminadoEn?: string | null;
}

// CORRECCIÓN: se agregó idSucursal que usa EmpleadosPage al llamar updateUserProfile
export interface UpdateProfileDto {
  nombres?: string;
  apellidos?: string;
  ci?: string;
  telefono?: string;
  horaEntrada?: string;
  horaSalida?: string;
  turno?: string;
  fechaContratacion?: string;
  idSucursal?: number;
  estado?: string;
}

// =======================
// DTOs existentes
// =======================

export interface CreateClienteDto {
  tipoCliente: "NATURAL" | "JURIDICO";
  nombreRazonSocial: string;
  ci?: string;
  nit?: string;
  telefono: string;
  direccion: string;
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {}

export interface CreateConsignatarioDto {
  nombres: string;
  telefono: string;
}

export interface UpdateConsignatarioDto extends Partial<CreateConsignatarioDto> {}

export interface CreateSucursalDto {
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

export interface UpdateSucursalDto {
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  estado?: string;
}

// =======================
// NUEVAS INTERFACES
// =======================

export interface DetalleEncomienda {
  idDetalle: number;
  descripcion: string;
  cantidad: number;
  pesoKg: number;
  costoFlete: number;
  idEncomienda: number;
}

export interface Pago {
  idPago: number;
  monto: number;
  fecha: string;
  referencia?: string;
  comprobanteUrl?: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  idEncomienda: number;
}

export interface Encomienda {
  idEncomienda: number;
  nroGuia: string;
  fechaEmision: string;
  fechaLimiteEntrega: string;
  observaciones?: string;
  costoTotal: number;
  estadoEntrega: EstadoEntrega;
  estadoPago: EstadoPago;

  idCliente: number;
  cliente?: Cliente;

  idConsignatario: number;
  consignatario?: Consignatario;

  idEmpleado: number;
  empleado?: UserProfile;

  idSucursalOrigen: number;
  sucursalOrigen?: Sucursal;

  idSucursalDestino: number;
  sucursalDestino?: Sucursal;

  detalles?: DetalleEncomienda[];
  pagos?: Pago[];

  creadoEn: string;
  eliminadoEn?: string | null;
}

export interface CreateDetalleEncomiendaDto {
  descripcion: string;
  cantidad: number;
  pesoKg: number;
  costoFlete: number;
  idEncomienda: number;
}

export interface CreateEncomiendaDto {
  fechaLimiteEntrega: string;
  observaciones?: string;
  costoTotal: number;
  idCliente: number;
  idConsignatario: number;
  idSucursalDestino: number;
}

export interface CreatePagoDto {
  monto: number;
  fecha: string;
  referencia?: string;
  metodoPago: MetodoPago;
  idEncomienda: number;
}

export interface UpdateEncomiendaDto {
  estadoEntrega?: EstadoEntrega;
  estadoPago?: EstadoPago;
  observaciones?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin" | "super_admin";
}
