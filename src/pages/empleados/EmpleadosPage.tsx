// src/pages/empleados/EmpleadosPage.tsx
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
    estado: "Activo", // ✅ antes era activo: true
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

  // Super admin ve admins y empleados; admin ve solo empleados de su sucursal
  const visibleUsers =
    currentUser?.role === "super_admin"
      ? data.filter((u) => u.role !== "super_admin")
      : data.filter((u) => u.role === "user");

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

    // ✅ Confirma que activo llega como booleano real
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
      estado: editForm.estado ?? "", // ✅ forzar booleano explícito
    };

    console.log("Enviando payload:", payload); // quita esto después de probar

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

  // Buscar empleado por email para asignar a sucursal (admin)
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

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Rol",
      render: (row: UserProfile) => (
        <span
          className={`badge ${row.role === "admin" ? "bg-warning text-dark" : "bg-secondary"}`}
        >
          {row.role === "admin" ? "Admin" : "Empleado"}
        </span>
      ),
    },
    { key: "ci", label: "CI" },
    { key: "turno", label: "Turno" },
    {
      key: "idSucursal",
      label: "Sucursal",
      render: (row: UserProfile) =>
        row.sucursal?.ciudad ?? (row.idSucursal ? `ID ${row.idSucursal}` : "-"),
    },
    {
      key: "estado",
      label: "Estado",
      render: (row: UserProfile) => (
        <span
          className={`badge ${row.estado === "Activo" ? "bg-success" : "bg-danger"}`}
        >
          {row.estado ?? "Inactivo"}
        </span>
      ),
    },
  ];

  if (!canView("empleados")) {
    return (
      <div className="text-center py-5">
        <h3>Acceso Denegado</h3>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Empleados"
        subtitle="Gestión de personal de la empresa"
        action={
          <div className="d-flex gap-2">
            {/* Super admin puede crear usuarios con cualquier rol */}
            {currentUser?.role === "super_admin" && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                + Nuevo Usuario
              </button>
            )}
            {/* Admin puede asignar empleados a su sucursal */}
            {currentUser?.role === "admin" && (
              <button
                className="btn btn-success"
                onClick={async () => {
                  await loadSucursales();
                  setShowAsignarModal(true);
                }}
              >
                + Agregar Empleado a mi Sucursal
              </button>
            )}
          </div>
        }
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={visibleUsers}
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
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Perfil</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    { label: "Nombres", key: "nombres" },
                    { label: "Apellidos", key: "apellidos" },
                    { label: "CI", key: "ci" },
                    { label: "Teléfono", key: "telefono" },
                    { label: "Turno", key: "turno" },
                  ].map(({ label, key }) => (
                    <div className="col-md-6" key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(editForm as any)[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <div className="col-md-3">
                    <label className="form-label">Hora Entrada</label>
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
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Hora Salida</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editForm.horaSalida}
                      onChange={(e) =>
                        setEditForm({ ...editForm, horaSalida: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Fecha Contratación</label>
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
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={editForm.estado}
                      onChange={(e) =>
                        setEditForm({ ...editForm, estado: e.target.value })
                      }
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sucursal</label>
                    <select
                      className="form-select"
                      value={editForm.idSucursal}
                      onChange={(e) =>
                        setEditForm({ ...editForm, idSucursal: e.target.value })
                      }
                    >
                      <option value="">Sin sucursal</option>
                      {sucursales.map((s) => (
                        <option key={s.idSucursal} value={s.idSucursal}>
                          {s.nombre} - {s.ciudad}
                        </option>
                      ))}
                    </select>
                    {currentUser?.role === "admin" && (
                      <small className="text-muted">
                        Puedes desasignar al empleado quitando la sucursal
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal CREAR usuario (solo super_admin) */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Usuario</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value as any,
                      })
                    }
                  >
                    <option value="user">Empleado</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleCreate}>
                  Crear Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ASIGNAR a sucursal (solo admin) */}
      {showAsignarModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Agregar Empleado a mi Sucursal</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowAsignarModal(false);
                    setSelectedToAssign(null);
                  }}
                />
              </div>
              <div className="modal-body">
                {!selectedToAssign ? (
                  <>
                    <p className="text-muted">
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
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleSearchEmail}
                      >
                        Buscar
                      </button>
                    </div>
                    {searchResults.length > 0 && (
                      <ul className="list-group">
                        {searchResults.map((emp) => (
                          <li
                            key={emp.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectToAssign(emp)}
                          >
                            <div>
                              <strong>{emp.name}</strong>
                              <small className="text-muted ms-2">
                                {emp.email}
                              </small>
                            </div>
                            <span className="badge bg-secondary">
                              {emp.idSucursal
                                ? `Sucursal #${emp.idSucursal}`
                                : "Sin sucursal"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {searchResults.length === 0 && searchEmail && (
                      <p className="text-muted text-center">
                        No se encontraron empleados con ese email.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="alert alert-info">
                      Asignando a: <strong>{selectedToAssign.name}</strong> (
                      {selectedToAssign.email})
                      <button
                        className="btn btn-sm btn-link"
                        onClick={() => setSelectedToAssign(null)}
                      >
                        Cambiar
                      </button>
                    </div>
                    <div className="row g-3">
                      {[
                        { label: "Nombres", key: "nombres" },
                        { label: "Apellidos", key: "apellidos" },
                        { label: "CI", key: "ci" },
                        { label: "Teléfono", key: "telefono" },
                        { label: "Turno", key: "turno" },
                      ].map(({ label, key }) => (
                        <div className="col-md-6" key={key}>
                          <label className="form-label">{label}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={(asignarForm as any)[key]}
                            onChange={(e) =>
                              setAsignarForm({
                                ...asignarForm,
                                [key]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                      <div className="col-md-3">
                        <label className="form-label">Hora Entrada</label>
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
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Hora Salida</label>
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
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Fecha Contratación</label>
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
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Sucursal</label>
                        <select
                          className="form-select"
                          value={asignarForm.idSucursal}
                          onChange={(e) =>
                            setAsignarForm({
                              ...asignarForm,
                              idSucursal: e.target.value,
                            })
                          }
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
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAsignarModal(false);
                    setSelectedToAssign(null);
                  }}
                >
                  Cancelar
                </button>
                {selectedToAssign && (
                  <button
                    className="btn btn-success"
                    onClick={handleSaveAsignar}
                  >
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
