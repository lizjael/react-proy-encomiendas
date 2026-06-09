// src/pages/empleados/EmpleadosPage.tsx
import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllUsers,
  deleteUser,
  updateUserProfile,
} from "../../api/endpoints/users.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import type { UserProfile, Sucursal } from "../../types";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export function EmpleadosPage() {
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserProfile | undefined>();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
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
  });

  const { canEdit, canDelete, canView } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<UserProfile>({
    fetchFn: getAllUsers,
    deleteFn: deleteUser,
  });

  // Solo empleados (role === "user")
  const empleados = data.filter((user) => user.role === "user");

  // Si es admin, mostrar solo empleados de su propia sucursal
  // CORRECCIÓN: comparar con currentUser.idSucursal (no con .sub que es el userId)
  const filteredEmpleados =
    currentUser?.role === "admin" && currentUser.idSucursal
      ? empleados.filter((emp) => emp.idSucursal === currentUser.idSucursal)
      : empleados;

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
    });

    if (sucursales.length === 0) {
      const sucursalesData = await getAllSucursales();
      setSucursales(sucursalesData);
    }

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      await updateUserProfile(selectedItem.id, {
        nombres: editForm.nombres,
        apellidos: editForm.apellidos,
        ci: editForm.ci,
        telefono: editForm.telefono,
        turno: editForm.turno,
        horaEntrada: editForm.horaEntrada,
        horaSalida: editForm.horaSalida,
        fechaContratacion: editForm.fechaContratacion,
        idSucursal: editForm.idSucursal
          ? parseInt(editForm.idSucursal)
          : undefined,
      });
      toast.success("Perfil actualizado correctamente");
      refresh();
      setShowModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar perfil",
      );
    }
  };

  const columns = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "ci", label: "CI" },
    { key: "turno", label: "Turno" },
    { key: "idSucursal", label: "Sucursal" },
    {
      key: "estado",
      label: "Estado",
      render: (row: UserProfile) =>
        row.eliminadoEn ? (
          <span className="badge bg-danger">Eliminado</span>
        ) : (
          <span className="badge bg-success">Activo</span>
        ),
    },
  ];

  if (!canView("empleados")) {
    return (
      <div className="text-center py-5">
        <h3>Acceso Denegado</h3>
        <p>No tienes permisos para ver esta página</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Empleados"
        subtitle="Gestión de personal de la empresa"
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredEmpleados}
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

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Perfil de Empleado</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.nombres}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nombres: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.apellidos}
                      onChange={(e) =>
                        setEditForm({ ...editForm, apellidos: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">CI</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.ci}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ci: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.telefono}
                      onChange={(e) =>
                        setEditForm({ ...editForm, telefono: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Turno</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.turno}
                      onChange={(e) =>
                        setEditForm({ ...editForm, turno: e.target.value })
                      }
                    />
                  </div>
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
                    <label className="form-label">Sucursal</label>
                    <select
                      className="form-select"
                      value={editForm.idSucursal}
                      onChange={(e) =>
                        setEditForm({ ...editForm, idSucursal: e.target.value })
                      }
                    >
                      <option value="">Seleccionar sucursal...</option>
                      {sucursales.map((s) => (
                        <option key={s.idSucursal} value={s.idSucursal}>
                          {s.nombre} - {s.ciudad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Empleado"
        message={`¿Estás seguro de eliminar al empleado "${selectedItem?.name}"?`}
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
