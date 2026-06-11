// src/pages/consignatarios/ConsignatariosPage.tsx
import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { ConsignatarioFormModal } from "../../components/forms/ConsignatarioFormModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllConsignatarios,
  deleteConsignatario,
} from "../../api/endpoints/consignatarios.api";
import type { Consignatario } from "../../types";

export function ConsignatariosPage() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Consignatario | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<Consignatario>({
    fetchFn: getAllConsignatarios,
    deleteFn: deleteConsignatario,
  });

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nombres.toLowerCase().includes(searchLower) ||
      item.telefono.includes(searchTerm)
    );
  });

  const columns = [
    { key: "idConsignatario", label: "ID", className: "text-center" },
    { key: "nombres", label: "Nombres" },
    { key: "telefono", label: "Teléfono" },
  ];

  if (!canView("consignatarios")) {
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
        title="Consignatarios"
        subtitle="Gestión de consignatarios de encomiendas"
        action={
          canCreate("consignatarios") && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedItem(undefined);
                setShowModal(true);
              }}
            >
              + Nuevo Consignatario
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
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            onEdit={canEdit("consignatarios") ? handleEdit : undefined}
            onDelete={canDelete("consignatarios") ? handleDelete : undefined}
            canEdit={canEdit("consignatarios")}
            canDelete={canDelete("consignatarios")}
            getId={(row) => row.idConsignatario}
          />
        </div>
      </div>

      <ConsignatarioFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        onSaved={handleSave}
      />

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Consignatario"
        message={`¿Estás seguro de eliminar al consignatario "${selectedItem?.nombres}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedItem(undefined);
        }}
      />
    </div>
  );

  function handleEdit(item: Consignatario) {
    setSelectedItem(item);
    setShowModal(true);
  }

  function handleDelete(item: Consignatario) {
    setSelectedItem(item);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    if (selectedItem) {
      await deleteItem(selectedItem.idConsignatario);
      setShowConfirm(false);
      setSelectedItem(undefined);
    }
  }

  function handleSave() {
    refresh();
  }
}
