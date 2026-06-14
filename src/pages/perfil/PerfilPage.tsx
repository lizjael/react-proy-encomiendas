// src/pages/perfil/PerfilPage.tsx - VERSIÓN CORRECTA (respeta lógica original)
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../../api/endpoints/users.api";
import { PageHeader } from "../../components/ui/PageHeader";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { Spinner } from "../../components/ui/Spinner";
import type { UserProfile, UpdateProfileDto } from "../../types";
import {
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Clock,
  Calendar,
  UserCircle,
  Edit2,
  Save,
  X,
} from "lucide-react";

const personalInfoSchema = yup.object({
  nombres: yup.string().max(100, "Máximo 100 caracteres"),
  apellidos: yup.string().max(100, "Máximo 100 caracteres"),
  ci: yup
    .string()
    .matches(/^[a-zA-Z0-9]+$/, "Solo letras y números")
    .min(5, "Mínimo 5 caracteres")
    .max(20, "Máximo 20 caracteres"),
  telefono: yup
    .string()
    .matches(/^[0-9]+$/, "Solo números")
    .min(7, "Mínimo 7 dígitos")
    .max(20, "Máximo 20 caracteres"),
});

const workInfoSchema = yup.object({
  turno: yup.string(),
  horaEntrada: yup.string(),
  horaSalida: yup.string(),
  fechaContratacion: yup.string(),
});

export function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingWork, setEditingWork] = useState(false);

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: personalErrors },
  } = useForm({
    resolver: yupResolver(personalInfoSchema),
  });

  const { register: registerWork, handleSubmit: handleSubmitWork } = useForm({
    resolver: yupResolver(workInfoSchema),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePersonal = async (data: UpdateProfileDto) => {
    try {
      const updated = await updateMyProfile(data);
      setProfile(updated);
      setEditingPersonal(false);
      toast.success("Datos personales actualizados");
    } catch (error) {
      toast.error("Error al actualizar datos personales");
    }
  };

  const onUpdateWork = async (data: UpdateProfileDto) => {
    try {
      const updated = await updateMyProfile(data);
      setProfile(updated);
      setEditingWork(false);
      toast.success("Datos laborales actualizados");
    } catch (error) {
      toast.error("Error al actualizar datos laborales");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <Spinner fullPage />;

  if (!profile) return null;

  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal y laboral"
        icon={<UserCircle size={24} />}
      />

      <div className="row g-4">
        {/* Columna izquierda - Información del usuario */}
        <div className="col-lg-4">
          <div
            className="rounded-3 overflow-hidden text-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "16px",
              position: "sticky",
              top: "20px",
            }}
          >
            {/* Avatar */}
            <div className="pt-5 pb-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "120px",
                  height: "120px",
                  backgroundColor: "#8B1A1A",
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(139, 26, 26, 0.2)",
                }}
              >
                {getInitials(profile.name)}
              </div>
            </div>

            {/* Información básica */}
            <div className="px-4 pb-3">
              <h3
                className="fw-bold mb-1"
                style={{
                  color: "#1A1A1A",
                  fontSize: "1.25rem",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {profile.name}
              </h3>
              <p
                className="mb-2"
                style={{ color: "#6B7280", fontSize: "0.85rem" }}
              >
                {profile.email}
              </p>
              <div className="mb-3">
                <RoleBadge role={profile.role} />
              </div>
            </div>

            <div className="border-top" style={{ borderColor: "#E5E0D8" }} />

            {/* Información de la cuenta */}
            <div className="p-4 text-start">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(139, 26, 26, 0.08)",
                    width: "36px",
                    height: "36px",
                  }}
                >
                  <Building2 size={18} color="#8B1A1A" />
                </div>
                <div>
                  <p className="mb-0 small text-muted">Sucursal</p>
                  <p
                    className="mb-0 fw-semibold"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {profile.sucursal?.nombre || "No asignada"}
                  </p>
                </div>
              </div>

              {profile.sucursal?.ciudad && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(212, 160, 23, 0.08)",
                      width: "36px",
                      height: "36px",
                    }}
                  >
                    <Building2 size={18} color="#D4A017" />
                  </div>
                  <div>
                    <p className="mb-0 small text-muted">Ciudad</p>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {profile.sucursal?.ciudad || "No especificada"}
                    </p>
                  </div>
                </div>
              )}

              {profile.turno && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(2, 132, 199, 0.08)",
                      width: "36px",
                      height: "36px",
                    }}
                  >
                    <Clock size={18} color="#0284C7" />
                  </div>
                  <div>
                    <p className="mb-0 small text-muted">Turno</p>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {profile.turno || "No especificado"}
                    </p>
                  </div>
                </div>
              )}

              {profile.fechaContratacion && (
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: "rgba(22, 163, 74, 0.08)",
                      width: "36px",
                      height: "36px",
                    }}
                  >
                    <Calendar size={18} color="#16A34A" />
                  </div>
                  <div>
                    <p className="mb-0 small text-muted">
                      Fecha de contratación
                    </p>
                    <p
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {formatDate(profile.fechaContratacion)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-top" style={{ borderColor: "#E5E0D8" }} />

            {/* Metadata */}
            <div className="p-4 text-center">
              <p className="mb-0 small text-muted">
                Miembro desde {formatDate(profile.creadoEn)}
              </p>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-8">
          <div className="row g-4">
            {/* Datos personales */}
            <div className="col-12">
              <div
                className="rounded-3 overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E0D8",
                  borderRadius: "16px",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-center p-4 border-bottom"
                  style={{ borderColor: "#E5E0D8" }}
                >
                  <h5
                    className="fw-semibold mb-0 d-flex align-items-center gap-2"
                    style={{ color: "#1A1A1A" }}
                  >
                    <User size={18} color="#8B1A1A" />
                    Datos personales
                  </h5>
                  {!editingPersonal && (
                    <button
                      className="btn d-flex align-items-center gap-2"
                      onClick={() => setEditingPersonal(true)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #E5E0D8",
                        borderRadius: "8px",
                        padding: "0.35rem 0.75rem",
                        color: "#6B7280",
                        fontSize: "0.75rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F8F5F0";
                        e.currentTarget.style.color = "#8B1A1A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#6B7280";
                      }}
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                  )}
                </div>

                <div className="p-4">
                  {editingPersonal ? (
                    <form onSubmit={handleSubmitPersonal(onUpdatePersonal)}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Nombres
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={profile.nombres || ""}
                            {...registerPersonal("nombres")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                          {personalErrors.nombres && (
                            <small
                              className="text-danger d-block mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {personalErrors.nombres.message}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Apellidos
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={profile.apellidos || ""}
                            {...registerPersonal("apellidos")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                          {personalErrors.apellidos && (
                            <small
                              className="text-danger d-block mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {personalErrors.apellidos.message}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            <Shield size={14} className="me-1" />
                            CI
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={profile.ci || ""}
                            {...registerPersonal("ci")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                          {personalErrors.ci && (
                            <small
                              className="text-danger d-block mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {personalErrors.ci.message}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            <Phone size={14} className="me-1" />
                            Teléfono
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            defaultValue={profile.telefono || ""}
                            {...registerPersonal("telefono")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                          {personalErrors.telefono && (
                            <small
                              className="text-danger d-block mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {personalErrors.telefono.message}
                            </small>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            <Mail size={14} className="me-1" />
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={profile.email}
                            disabled
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                              backgroundColor: "#F8F5F0",
                            }}
                          />
                        </div>

                        <div className="col-12 mt-3">
                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn d-flex align-items-center gap-2"
                              style={{
                                backgroundColor: "#8B1A1A",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.5rem 1.5rem",
                                color: "#FFFFFF",
                                fontWeight: 500,
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#5C0E0E";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#8B1A1A";
                              }}
                            >
                              <Save size={16} />
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn d-flex align-items-center gap-2"
                              onClick={() => setEditingPersonal(false)}
                              style={{
                                backgroundColor: "transparent",
                                border: "1px solid #E5E0D8",
                                borderRadius: "10px",
                                padding: "0.5rem 1.5rem",
                                color: "#6B7280",
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#F8F5F0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <X size={16} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Nombres</p>
                        <p className="mb-0 fw-semibold">
                          {profile.nombres || "No especificado"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Apellidos</p>
                        <p className="mb-0 fw-semibold">
                          {profile.apellidos || "No especificado"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">CI</p>
                        <p className="mb-0 fw-semibold">
                          {profile.ci || "No especificado"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Teléfono</p>
                        <p className="mb-0 fw-semibold">
                          {profile.telefono || "No especificado"}
                        </p>
                      </div>
                      <div className="col-12">
                        <p className="mb-1 small text-muted">Email</p>
                        <p className="mb-0 fw-semibold">{profile.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Datos laborales */}
            <div className="col-12">
              <div
                className="rounded-3 overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E0D8",
                  borderRadius: "16px",
                }}
              >
                <div
                  className="d-flex justify-content-between align-items-center p-4 border-bottom"
                  style={{ borderColor: "#E5E0D8" }}
                >
                  <h5
                    className="fw-semibold mb-0 d-flex align-items-center gap-2"
                    style={{ color: "#1A1A1A" }}
                  >
                    <Building2 size={18} color="#8B1A1A" />
                    Datos laborales
                  </h5>
                  {isAdminOrSuper && !editingWork && (
                    <button
                      className="btn d-flex align-items-center gap-2"
                      onClick={() => setEditingWork(true)}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #E5E0D8",
                        borderRadius: "8px",
                        padding: "0.35rem 0.75rem",
                        color: "#6B7280",
                        fontSize: "0.75rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#F8F5F0";
                        e.currentTarget.style.color = "#8B1A1A";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#6B7280";
                      }}
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                  )}
                </div>

                <div className="p-4">
                  {editingWork ? (
                    <form onSubmit={handleSubmitWork(onUpdateWork)}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Turno
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={profile.turno || ""}
                            {...registerWork("turno")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Hora Entrada
                          </label>
                          <input
                            type="time"
                            className="form-control"
                            defaultValue={profile.horaEntrada || ""}
                            {...registerWork("horaEntrada")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Hora Salida
                          </label>
                          <input
                            type="time"
                            className="form-control"
                            defaultValue={profile.horaSalida || ""}
                            {...registerWork("horaSalida")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>

                        <div className="col-md-6">
                          <label
                            className="form-label fw-semibold mb-2"
                            style={{ color: "#374151", fontSize: "0.8rem" }}
                          >
                            Fecha Contratación
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            defaultValue={
                              profile.fechaContratacion?.split("T")[0] || ""
                            }
                            {...registerWork("fechaContratacion")}
                            style={{
                              borderRadius: "10px",
                              borderColor: "#E5E0D8",
                              height: "45px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </div>

                        <div className="col-12 mt-3">
                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn d-flex align-items-center gap-2"
                              style={{
                                backgroundColor: "#8B1A1A",
                                border: "none",
                                borderRadius: "10px",
                                padding: "0.5rem 1.5rem",
                                color: "#FFFFFF",
                                fontWeight: 500,
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#5C0E0E";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#8B1A1A";
                              }}
                            >
                              <Save size={16} />
                              Guardar
                            </button>
                            <button
                              type="button"
                              className="btn d-flex align-items-center gap-2"
                              onClick={() => setEditingWork(false)}
                              style={{
                                backgroundColor: "transparent",
                                border: "1px solid #E5E0D8",
                                borderRadius: "10px",
                                padding: "0.5rem 1.5rem",
                                color: "#6B7280",
                                fontSize: "0.85rem",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#F8F5F0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <X size={16} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Sucursal</p>
                        <p className="mb-0 fw-semibold">
                          {profile.sucursal?.nombre
                            ? `${profile.sucursal.nombre}`
                            : "No asignada"}
                        </p>
                        {profile.sucursal?.ciudad && (
                          <small className="text-muted">
                            {profile.sucursal.ciudad}
                          </small>
                        )}
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Turno</p>
                        <p className="mb-0 fw-semibold">
                          {profile.turno || "No especificado"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Hora Entrada</p>
                        <p className="mb-0 fw-semibold">
                          {profile.horaEntrada || "No especificado"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 small text-muted">Hora Salida</p>
                        <p className="mb-0 fw-semibold">
                          {profile.horaSalida || "No especificado"}
                        </p>
                      </div>
                      <div className="col-12">
                        <p className="mb-1 small text-muted">
                          Fecha Contratación
                        </p>
                        <p className="mb-0 fw-semibold">
                          {formatDate(profile.fechaContratacion)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
