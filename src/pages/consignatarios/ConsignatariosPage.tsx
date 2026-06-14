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
import { Handshake, Search, Plus, Phone } from "lucide-react";

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
    {
      key: "idConsignatario",
      label: "ID",
      className: "text-center",
      mobileHidden: true,
    },
    { key: "nombres", label: "Nombres" },
    {
      key: "telefono",
      label: "Teléfono",
      render: (row: Consignatario) => (
        <div className="d-flex align-items-center gap-2">
          <Phone size={14} color="#9CA3AF" />
          <span>{row.telefono}</span>
        </div>
      ),
    },
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
        icon={<Handshake size={24} />}
        action={
          canCreate("consignatarios") && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => {
                setSelectedItem(undefined);
                setShowModal(true);
              }}
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
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B1A1A";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Plus size={18} />
              Nuevo Consignatario
            </button>
          )
        }
      />

      <div
        className="rounded-3 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="p-4 border-bottom" style={{ borderColor: "#E5E0D8" }}>
          <div className="position-relative" style={{ maxWidth: "350px" }}>
            <Search
              size={18}
              color="#9CA3AF"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                paddingLeft: "38px",
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            />
          </div>
        </div>

        <div className="p-0">
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
