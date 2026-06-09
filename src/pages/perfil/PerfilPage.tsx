// src/pages/perfil/PerfilPage.tsx
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

  const {
    register: registerWork,
    handleSubmit: handleSubmitWork,
  } = useForm({
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
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  if (loading) return <Spinner fullPage />;

  if (!profile) return null;

  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal y laboral"
      />

      <div className="row g-4">
        {/* Sección 1 - Datos de cuenta */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-4">
                <div
                  className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ width: "80px", height: "80px", fontSize: "32px" }}
                >
                  {getInitials(profile.name)}
                </div>
                <div className="flex-grow-1">
                  <h3 className="mb-1">{profile.name}</h3>
                  <p className="text-muted mb-2">{profile.email}</p>
                  <RoleBadge role={profile.role} />
                </div>
                <div className="text-end text-muted">
                  <small>Cuenta creada</small>
                  <br />
                  <small>{formatDate(profile.creadoEn)}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2 - Datos personales */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Datos personales</h5>
              {!editingPersonal && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setEditingPersonal(true)}
                >
                  ✏️ Editar
                </button>
              )}
            </div>
            <div className="card-body">
              {editingPersonal ? (
                <form onSubmit={handleSubmitPersonal(onUpdatePersonal)}>
                  <div className="mb-3">
                    <label className="form-label">Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={profile.nombres || ""}
                      {...registerPersonal("nombres")}
                    />
                    {personalErrors.nombres && (
                      <small className="text-danger">
                        {personalErrors.nombres.message}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={profile.apellidos || ""}
                      {...registerPersonal("apellidos")}
                    />
                    {personalErrors.apellidos && (
                      <small className="text-danger">
                        {personalErrors.apellidos.message}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CI</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={profile.ci || ""}
                      {...registerPersonal("ci")}
                    />
                    {personalErrors.ci && (
                      <small className="text-danger">
                        {personalErrors.ci.message}
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      defaultValue={profile.telefono || ""}
                      {...registerPersonal("telefono")}
                    />
                    {personalErrors.telefono && (
                      <small className="text-danger">
                        {personalErrors.telefono.message}
                      </small>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingPersonal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p>
                    <strong>Nombres:</strong>{" "}
                    {profile.nombres || "No especificado"}
                  </p>
                  <p>
                    <strong>Apellidos:</strong>{" "}
                    {profile.apellidos || "No especificado"}
                  </p>
                  <p>
                    <strong>CI:</strong> {profile.ci || "No especificado"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {profile.telefono || "No especificado"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección 3 - Datos laborales */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🏢 Datos laborales</h5>
              {isAdminOrSuper && !editingWork && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setEditingWork(true)}
                >
                  ✏️ Editar
                </button>
              )}
            </div>
            <div className="card-body">
              {editingWork ? (
                <form onSubmit={handleSubmitWork(onUpdateWork)}>
                  <div className="mb-3">
                    <label className="form-label">Turno</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={profile.turno || ""}
                      {...registerWork("turno")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hora Entrada</label>
                    <input
                      type="time"
                      className="form-control"
                      defaultValue={profile.horaEntrada || ""}
                      {...registerWork("horaEntrada")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hora Salida</label>
                    <input
                      type="time"
                      className="form-control"
                      defaultValue={profile.horaSalida || ""}
                      {...registerWork("horaSalida")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha Contratación</label>
                    <input
                      type="date"
                      className="form-control"
                      defaultValue={
                        profile.fechaContratacion?.split("T")[0] || ""
                      }
                      {...registerWork("fechaContratacion")}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingWork(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p>
                    <strong>Sucursal:</strong>{" "}
                    {profile.idSucursal
                      ? `ID: ${profile.idSucursal}`
                      : "No asignada"}
                  </p>
                  <p>
                    <strong>Turno:</strong> {profile.turno || "No especificado"}
                  </p>
                  <p>
                    <strong>Hora Entrada:</strong>{" "}
                    {profile.horaEntrada || "No especificado"}
                  </p>
                  <p>
                    <strong>Hora Salida:</strong>{" "}
                    {profile.horaSalida || "No especificado"}
                  </p>
                  <p>
                    <strong>Fecha Contratación:</strong>{" "}
                    {formatDate(profile.fechaContratacion)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
