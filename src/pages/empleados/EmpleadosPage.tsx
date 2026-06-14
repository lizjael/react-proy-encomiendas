import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";
import {
  getAllUsers,
  deleteUser,
  updateUserProfile,
  createUser,
} from "../../api/endpoints/users.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import type { UserProfile, Sucursal } from "../../types";
import { toast } from "react-toastify";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  X,
  Save,
  UserCog,
  Shield,
  Phone,
  Building2,
} from "lucide-react";

export function EmpleadosPage() {
  const { user: currentUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserProfile | undefined>();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedToAssign, setSelectedToAssign] = useState<UserProfile | null>(
    null,
  );
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [filtroSucursal, setFiltroSucursal] = useState<string>("TODOS");

  const [editForm, setEditForm] = useState({
    nombres: "",
    apellidos: "",
    ci: "",
    telefono: "",
    turno: "",
    horaEntrada: "",
    horaSalida: "",
    fechaContratacion: "",
    idSucursal: "",
    estado: "Activo",
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "admin" | "super_admin",
  });

  const [asignarForm, setAsignarForm] = useState({
    nombres: "",
    apellidos: "",
    ci: "",
    telefono: "",
    turno: "",
    horaEntrada: "",
    horaSalida: "",
    fechaContratacion: "",
    idSucursal: "",
    estado: "",
  });

  const { canEdit, canDelete, canView } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<UserProfile>({
    fetchFn: getAllUsers,
    deleteFn: deleteUser,
  });

  const visibleUsers =
    currentUser?.role === "super_admin"
      ? data.filter((u) => u.role !== "super_admin")
      : data.filter((u) => u.role === "user");

  const filteredUsers = visibleUsers.filter((user) => {
    if (filtroRol !== "TODOS" && user.role !== filtroRol) return false;
    if (filtroSucursal !== "TODOS") {
      const sucursalId = parseInt(filtroSucursal);
      if (user.idSucursal !== sucursalId) return false;
    }
    return true;
  });

  const loadSucursales = async () => {
    if (sucursales.length === 0) {
      const s = await getAllSucursales();
      setSucursales(s);
    }
  };

  const handleEdit = async (item: UserProfile) => {
    setSelectedItem(item);
    setEditForm({
      nombres: item.nombres ?? "",
      apellidos: item.apellidos ?? "",
      ci: item.ci ?? "",
      telefono: item.telefono ?? "",
      turno: item.turno ?? "",
      horaEntrada: item.horaEntrada ?? "",
      horaSalida: item.horaSalida ?? "",
      fechaContratacion: item.fechaContratacion?.split("T")[0] ?? "",
      idSucursal: item.idSucursal?.toString() ?? "",
      estado: item.estado ?? "Activo",
    });
    await loadSucursales();
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    const payload = {
      nombres: editForm.nombres || undefined,
      apellidos: editForm.apellidos || undefined,
      ci: editForm.ci || undefined,
      telefono: editForm.telefono || undefined,
      turno: editForm.turno || undefined,
      horaEntrada: editForm.horaEntrada || undefined,
      horaSalida: editForm.horaSalida || undefined,
      fechaContratacion: editForm.fechaContratacion || undefined,
      idSucursal: editForm.idSucursal
        ? parseInt(editForm.idSucursal)
        : undefined,
      estado: editForm.estado ?? "",
    };

    try {
      await updateUserProfile(selectedItem.id, payload);
      toast.success("Perfil actualizado correctamente");
      refresh();
      setShowEditModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar perfil",
      );
    }
  };

  const handleCreate = async () => {
    try {
      await createUser(createForm);
      toast.success("Usuario creado correctamente");
      refresh();
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", role: "user" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear usuario");
    }
  };

  const handleSearchEmail = () => {
    const found = data.filter(
      (u) =>
        u.role === "user" &&
        u.email.toLowerCase().includes(searchEmail.toLowerCase()),
    );
    setSearchResults(found);
  };

  const handleSelectToAssign = async (emp: UserProfile) => {
    setSelectedToAssign(emp);
    setAsignarForm({
      nombres: emp.nombres ?? "",
      apellidos: emp.apellidos ?? "",
      ci: emp.ci ?? "",
      telefono: emp.telefono ?? "",
      turno: emp.turno ?? "",
      horaEntrada: emp.horaEntrada ?? "",
      horaSalida: emp.horaSalida ?? "",
      fechaContratacion: emp.fechaContratacion?.split("T")[0] ?? "",
      idSucursal: currentUser?.idSucursal?.toString() ?? "",
      estado: emp.estado ?? "",
    });
    setSearchResults([]);
    setSearchEmail("");
  };

  const handleSaveAsignar = async () => {
    if (!selectedToAssign) return;
    try {
      await updateUserProfile(selectedToAssign.id, {
        nombres: asignarForm.nombres || undefined,
        apellidos: asignarForm.apellidos || undefined,
        ci: asignarForm.ci || undefined,
        telefono: asignarForm.telefono || undefined,
        turno: asignarForm.turno || undefined,
        horaEntrada: asignarForm.horaEntrada || undefined,
        horaSalida: asignarForm.horaSalida || undefined,
        fechaContratacion: asignarForm.fechaContratacion || undefined,
        idSucursal: asignarForm.idSucursal
          ? parseInt(asignarForm.idSucursal)
          : undefined,
        estado: asignarForm.estado || undefined,
      });
      toast.success("Empleado asignado a sucursal correctamente");
      refresh();
      setShowAsignarModal(false);
      setSelectedToAssign(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al asignar empleado");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const columns = [
    {
      key: "avatar",
      label: "",
      render: (row: UserProfile) => (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#8B1A1A",
            fontSize: "12px",
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          {getInitials(row.name)}
        </div>
      ),
    },
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Rol",
      render: (row: UserProfile) => {
        const roleConfig = {
          admin: {
            label: "Administrador",
            color: "#D4A017",
            bg: "rgba(212, 160, 23, 0.1)",
          },
          user: {
            label: "Empleado",
            color: "#6B7280",
            bg: "rgba(107, 114, 128, 0.1)",
          },
          super_admin: {
            label: "Super Admin",
            color: "#8B1A1A",
            bg: "rgba(139, 26, 26, 0.1)",
          },
        };
        const config = roleConfig[row.role];
        return (
          <span
            className="badge rounded-pill px-3 py-1"
            style={{
              backgroundColor: config.bg,
              color: config.color,
              fontSize: "0.7rem",
            }}
          >
            {config.label}
          </span>
        );
      },
    },
    { key: "ci", label: "CI", mobileHidden: true },
    { key: "turno", label: "Turno", mobileHidden: true },
    {
      key: "idSucursal",
      label: "Sucursal",
      render: (row: UserProfile) =>
        row.sucursal?.nombre ?? (row.idSucursal ? `ID ${row.idSucursal}` : "-"),
      mobileHidden: true,
    },
    {
      key: "estado",
      label: "Estado",
      render: (row: UserProfile) => (
        <span
          className="badge rounded-pill px-3 py-1"
          style={{
            backgroundColor:
              row.estado === "Activo"
                ? "rgba(22, 163, 74, 0.1)"
                : "rgba(220, 38, 38, 0.1)",
            color: row.estado === "Activo" ? "#16A34A" : "#DC2626",
            fontSize: "0.7rem",
          }}
        >
          {row.estado ?? "Activo"}
        </span>
      ),
      mobileHidden: true,
    },
  ];

  if (!canView("empleados")) {
    return (
      <div className="text-center py-5">
        <h3>Acceso Denegado</h3>
      </div>
    );
  }

  const sucursalesUnicas = Array.from(
    new Map(
      visibleUsers
        .filter((u) => u.sucursal)
        .map((u) => [u.sucursal!.idSucursal, u.sucursal]),
    ).values(),
  );

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Empleados"
        subtitle="Gestión de personal de la empresa"
        icon={<Users size={24} />}
        action={
          <div className="d-flex gap-2">
            {currentUser?.role === "super_admin" && (
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={() => setShowCreateModal(true)}
                style={{
                  backgroundColor: "#8B1A1A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#FFFFFF",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5C0E0E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#8B1A1A";
                }}
              >
                <UserPlus size={18} />
                Nuevo Usuario
              </button>
            )}
            {currentUser?.role === "admin" && (
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={async () => {
                  await loadSucursales();
                  setShowAsignarModal(true);
                }}
                style={{
                  backgroundColor: "#D4A017",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#1A1A1A",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C0392B";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#D4A017";
                  e.currentTarget.style.color = "#1A1A1A";
                }}
              >
                <UserCog size={18} />
                Agregar a mi Sucursal
              </button>
            )}
          </div>
        }
      />

      {/* Filtros */}
      <div
        className="rounded-3 mb-4 p-4"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Filter size={14} className="me-1" />
              Filtrar por Rol
            </label>
            <select
              className="form-select"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            >
              <option value="TODOS">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Empleados</option>
            </select>
          </div>
          <div className="col-md-4">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Building2 size={14} className="me-1" />
              Filtrar por Sucursal
            </label>
            <select
              className="form-select"
              value={filtroSucursal}
              onChange={(e) => setFiltroSucursal(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            >
              <option value="TODOS">Todas las sucursales</option>
              {sucursalesUnicas.map((sucursal) => (
                <option key={sucursal!.idSucursal} value={sucursal!.idSucursal}>
                  {sucursal!.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              &nbsp;
            </label>
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setFiltroRol("TODOS");
                setFiltroSucursal("TODOS");
              }}
              style={{
                backgroundColor: "#F8F5F0",
                border: "1px solid #E5E0D8",
                borderRadius: "10px",
                height: "42px",
                color: "#6B7280",
                fontSize: "0.85rem",
              }}
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className="rounded-3 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="p-0">
          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            onEdit={canEdit("empleados") ? handleEdit : undefined}
            onDelete={
              canDelete("empleados")
                ? (row) => {
                    setSelectedItem(row);
                    setShowConfirm(true);
                  }
                : undefined
            }
            canEdit={canEdit("empleados")}
            canDelete={canDelete("empleados")}
            getId={(row) => row.id}
          />
        </div>
      </div>

      {/* Modal EDITAR empleado */}
      {showEditModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1050,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                className="modal-header border-0"
                style={{
                  backgroundColor: "#1A1A1A",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <h5
                  className="modal-title fw-semibold d-flex align-items-center gap-2"
                  style={{ color: "#FFFFFF" }}
                >
                  <UserCog size={20} />
                  Editar Perfil de Empleado
                </h5>
                <button
                  type="button"
                  className="btn p-0"
                  onClick={() => setShowEditModal(false)}
                  style={{ color: "#FFFFFF", opacity: 0.7 }}
                >
                  <X size={20} />
                </button>
              </div>
              <div
                className="modal-body p-4"
                style={{ backgroundColor: "#F8F5F0" }}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Nombres
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.nombres}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nombres: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Apellidos
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.apellidos}
                      onChange={(e) =>
                        setEditForm({ ...editForm, apellidos: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      CI
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.ci}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ci: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <Phone size={14} className="me-1" />
                      Teléfono
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.telefono}
                      onChange={(e) =>
                        setEditForm({ ...editForm, telefono: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Turno
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Mañana, Tarde"
                      value={editForm.turno}
                      onChange={(e) =>
                        setEditForm({ ...editForm, turno: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Hora Entrada
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={editForm.horaEntrada}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          horaEntrada: e.target.value,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Hora Salida
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={editForm.horaSalida}
                      onChange={(e) =>
                        setEditForm({ ...editForm, horaSalida: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Fecha Contratación
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.fechaContratacion}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fechaContratacion: e.target.value,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Estado
                    </label>
                    <select
                      className="form-select"
                      value={editForm.estado}
                      onChange={(e) =>
                        setEditForm({ ...editForm, estado: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label
                      className="form-label fw-semibold"
                      style={{ fontSize: "0.8rem" }}
                    >
                      <Building2 size={14} className="me-1" />
                      Sucursal
                    </label>
                    <select
                      className="form-select"
                      value={editForm.idSucursal}
                      onChange={(e) =>
                        setEditForm({ ...editForm, idSucursal: e.target.value })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "42px",
                      }}
                    >
                      <option value="">Sin sucursal</option>
                      {sucursales.map((s) => (
                        <option key={s.idSucursal} value={s.idSucursal}>
                          {s.nombre} - {s.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div
                className="modal-footer border-0"
                style={{ backgroundColor: "#FFFFFF", padding: "1rem 1.5rem" }}
              >
                <button
                  className="btn"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #E5E0D8",
                    borderRadius: "10px",
                    padding: "0.5rem 1.25rem",
                    color: "#6B7280",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleSaveEdit}
                  style={{
                    backgroundColor: "#8B1A1A",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.5rem 1.25rem",
                    color: "#FFFFFF",
                  }}
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CREAR usuario */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1050,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                className="modal-header border-0"
                style={{
                  backgroundColor: "#1A1A1A",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <h5
                  className="modal-title fw-semibold"
                  style={{ color: "#FFFFFF" }}
                >
                  Nuevo Usuario
                </h5>
                <button
                  type="button"
                  className="btn p-0"
                  onClick={() => setShowCreateModal(false)}
                  style={{ color: "#FFFFFF", opacity: 0.7 }}
                >
                  <X size={20} />
                </button>
              </div>
              <div
                className="modal-body p-4"
                style={{ backgroundColor: "#F8F5F0" }}
              >
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <Shield size={14} className="me-1" />
                    Rol *
                  </label>
                  <select
                    className="form-select"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value as any,
                      })
                    }
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                    }}
                  >
                    <option value="user">Empleado</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                </div>
              </div>
              <div
                className="modal-footer border-0"
                style={{ backgroundColor: "#FFFFFF", padding: "1rem 1.5rem" }}
              >
                <button
                  className="btn"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #E5E0D8",
                    borderRadius: "10px",
                    padding: "0.5rem 1.25rem",
                    color: "#6B7280",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleCreate}
                  style={{
                    backgroundColor: "#8B1A1A",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.5rem 1.25rem",
                    color: "#FFFFFF",
                  }}
                >
                  <UserPlus size={16} />
                  Crear Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ASIGNAR a sucursal */}
      {showAsignarModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1050,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content"
              style={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                overflow: "hidden",
              }}
            >
              <div
                className="modal-header border-0"
                style={{
                  backgroundColor: "#1A1A1A",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <h5
                  className="modal-title fw-semibold d-flex align-items-center gap-2"
                  style={{ color: "#FFFFFF" }}
                >
                  <UserCog size={20} />
                  Agregar Empleado a mi Sucursal
                </h5>
                <button
                  type="button"
                  className="btn p-0"
                  onClick={() => {
                    setShowAsignarModal(false);
                    setSelectedToAssign(null);
                  }}
                  style={{ color: "#FFFFFF", opacity: 0.7 }}
                >
                  <X size={20} />
                </button>
              </div>
              <div
                className="modal-body p-4"
                style={{ backgroundColor: "#F8F5F0" }}
              >
                {!selectedToAssign ? (
                  <>
                    <p className="text-muted mb-3">
                      Busca al empleado por email para asignarlo a tu sucursal.
                    </p>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSearchEmail()
                        }
                        style={{
                          borderRadius: "10px 0 0 10px",
                          borderColor: "#E5E0D8",
                        }}
                      />
                      <button
                        className="btn d-flex align-items-center gap-2"
                        onClick={handleSearchEmail}
                        style={{
                          backgroundColor: "#8B1A1A",
                          border: "none",
                          borderRadius: "0 10px 10px 0",
                          color: "#FFFFFF",
                        }}
                      >
                        <Search size={16} />
                        Buscar
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="list-group">
                        {searchResults.map((emp) => (
                          <button
                            key={emp.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => handleSelectToAssign(emp)}
                            style={{
                              borderRadius: "10px",
                              marginBottom: "8px",
                              border: "1px solid #E5E0D8",
                            }}
                          >
                            <div>
                              <strong>{emp.name}</strong>
                              <small className="text-muted ms-2">
                                {emp.email}
                              </small>
                            </div>
                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: emp.idSucursal
                                  ? "rgba(22, 163, 74, 0.1)"
                                  : "rgba(212, 160, 23, 0.1)",
                                color: emp.idSucursal ? "#16A34A" : "#D4A017",
                              }}
                            >
                              {emp.idSucursal
                                ? `Sucursal #${emp.idSucursal}`
                                : "Sin sucursal"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.length === 0 && searchEmail && (
                      <p className="text-muted text-center">
                        No se encontraron empleados con ese email.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className="alert d-flex justify-content-between align-items-center mb-4"
                      style={{
                        backgroundColor: "rgba(139, 26, 26, 0.08)",
                        border: "1px solid rgba(139, 26, 26, 0.2)",
                        borderRadius: "10px",
                      }}
                    >
                      <div>
                        <strong>{selectedToAssign.name}</strong>
                        <br />
                        <small>{selectedToAssign.email}</small>
                      </div>
                      <button
                        className="btn btn-sm"
                        onClick={() => setSelectedToAssign(null)}
                        style={{ color: "#8B1A1A" }}
                      >
                        Cambiar
                      </button>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Nombres
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={asignarForm.nombres}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              nombres: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Apellidos
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={asignarForm.apellidos}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              apellidos: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          CI
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={asignarForm.ci}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              ci: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Teléfono
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={asignarForm.telefono}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              telefono: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Turno
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Mañana"
                          value={asignarForm.turno}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              turno: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Hora Entrada
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          value={asignarForm.horaEntrada}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              horaEntrada: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Hora Salida
                        </label>
                        <input
                          type="time"
                          className="form-control"
                          value={asignarForm.horaSalida}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              horaSalida: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Fecha Contratación
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={asignarForm.fechaContratacion}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              fechaContratacion: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        />
                      </div>
                      <div className="col-md-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <Building2 size={14} className="me-1" />
                          Sucursal
                        </label>
                        <select
                          className="form-select"
                          value={asignarForm.idSucursal}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              idSucursal: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            borderColor: "#E5E0D8",
                            height: "42px",
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {sucursales.map((s) => (
                            <option key={s.idSucursal} value={s.idSucursal}>
                              {s.nombre} - {s.ciudad}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div
                className="modal-footer border-0"
                style={{ backgroundColor: "#FFFFFF", padding: "1rem 1.5rem" }}
              >
                <button
                  className="btn"
                  onClick={() => {
                    setShowAsignarModal(false);
                    setSelectedToAssign(null);
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #E5E0D8",
                    borderRadius: "10px",
                    padding: "0.5rem 1.25rem",
                    color: "#6B7280",
                  }}
                >
                  Cancelar
                </button>
                {selectedToAssign && (
                  <button
                    className="btn d-flex align-items-center gap-2"
                    onClick={handleSaveAsignar}
                    style={{
                      backgroundColor: "#8B1A1A",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.5rem 1.25rem",
                      color: "#FFFFFF",
                    }}
                  >
                    <Save size={16} />
                    Guardar y Asignar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar a "${selectedItem?.name}"?`}
        onConfirm={async () => {
          if (selectedItem) {
            await deleteItem(selectedItem.id);
            setShowConfirm(false);
            setSelectedItem(undefined);
          }
        }}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedItem(undefined);
        }}
      />
    </div>
  );
}
