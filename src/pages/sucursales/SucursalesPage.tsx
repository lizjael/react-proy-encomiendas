// src/pages/sucursales/SucursalesPage.tsx
import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { SucursalFormModal } from "../../components/forms/SucursalFormModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllSucursales,
  deleteSucursal,
} from "../../api/endpoints/sucursales.api";
import type { Sucursal } from "../../types";

export function SucursalesPage() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Sucursal | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<Sucursal>({
    fetchFn: getAllSucursales,
    deleteFn: deleteSucursal,
  });

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(searchLower) ||
      (item.ciudad ?? "").toLowerCase().includes(searchLower) ||
      (item.telefono ?? "").includes(searchTerm)
    );
  });

  const columns = [
    { key: "idSucursal", label: "ID", className: "text-center" },
    { key: "nombre", label: "Nombre" },
    { key: "ciudad", label: "Ciudad" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    {
      key: "estado",
      label: "Estado",
      render: (row: Sucursal) =>
        row.eliminadoEn ? (
          <span className="badge bg-danger">Eliminado</span>
        ) : (
          <span className="badge bg-success">Activo</span>
        ),
    },
  ];

  if (!canView("sucursales")) {
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
        title="Sucursales"
        subtitle="Gestión de sucursales de la empresa"
        action={
          canCreate("sucursales") && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedItem(undefined);
                setShowModal(true);
              }}
            >
              + Nueva Sucursal
            </button>
          )
        }
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, ciudad o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            onEdit={canEdit("sucursales") ? handleEdit : undefined}
            onDelete={canDelete("sucursales") ? handleDelete : undefined}
            canEdit={canEdit("sucursales")}
            canDelete={canDelete("sucursales")}
            getId={(row) => row.idSucursal}
          />
        </div>
      </div>

      <SucursalFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        onSaved={handleSave}
      />

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Sucursal"
        message={`¿Estás seguro de eliminar la sucursal "${selectedItem?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedItem(undefined);
        }}
      />
    </div>
  );

  function handleEdit(item: Sucursal) {
    setSelectedItem(item);
    setShowModal(true);
  }

  function handleDelete(item: Sucursal) {
    setSelectedItem(item);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (selectedItem) {
      await deleteItem(selectedItem.idSucursal);
      setShowConfirm(false);
      setSelectedItem(undefined);
    }
  }

  function handleSave() {
    refresh();
  }
}
