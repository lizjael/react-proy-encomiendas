import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { SucursalFormModal } from "../../components/forms/SucursalFormModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllSucursales,
  deleteSucursal,
} from "../../api/endpoints/sucursales.api";
import type { Sucursal } from "../../types";
import {
  Building2,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Plus,
  Search,
} from "lucide-react";

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

  const handleEdit = (item: Sucursal) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: Sucursal) => {
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.idSucursal);
      setShowConfirm(false);
      setSelectedItem(undefined);
    }
  };

  const handleSave = () => {
    refresh();
  };

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
        icon={<Building2 size={24} />}
        action={
          canCreate("sucursales") && (
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
              Nueva Sucursal
            </button>
          )
        }
      />

      {/* Barra de búsqueda */}
      <div className="mb-4">
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
            placeholder="Buscar por nombre, ciudad o teléfono..."
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

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div
            className="spinner-border"
            style={{ color: "#8B1A1A" }}
            role="status"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E0D8",
            borderRadius: "12px",
          }}
        >
          <Building2 size={48} color="#9CA3AF" style={{ opacity: 0.5 }} />
          <p className="mt-3" style={{ color: "#6B7280" }}>
            No hay sucursales registradas
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredData.map((sucursal) => (
            <div key={sucursal.idSucursal} className="col-sm-6 col-lg-4">
              <div
                className="h-100 position-relative rounded-3 overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E0D8",
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Badge de estado */}
                <div
                  className="position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 1 }}
                >
                  <span
                    className="badge rounded-pill px-2 py-1"
                    style={{
                      backgroundColor:
                        sucursal.estado === "Activo"
                          ? "rgba(22, 163, 74, 0.1)"
                          : "rgba(220, 38, 38, 0.1)",
                      color:
                        sucursal.estado === "Activo" ? "#16A34A" : "#DC2626",
                      fontSize: "0.65rem",
                    }}
                  >
                    {sucursal.estado || "Activo"}
                  </span>
                </div>

                {/* Contenido de la card */}
                <div className="p-4">
                  {/* Nombre de la sucursal */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Building2 size={20} color="#8B1A1A" />
                    <h5
                      className="mb-0 fw-semibold"
                      style={{
                        color: "#1A1A1A",
                        fontSize: "1.1rem",
                      }}
                    >
                      {sucursal.nombre}
                    </h5>
                  </div>

                  {/* Ciudad */}
                  {sucursal.ciudad && (
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <MapPin size={16} color="#9CA3AF" />
                      <span
                        style={{
                          color: "#4B5563",
                          fontSize: "0.85rem",
                        }}
                      >
                        {sucursal.ciudad}
                      </span>
                    </div>
                  )}

                  {/* Dirección */}
                  {sucursal.direccion && (
                    <div className="mb-2 ps-6" style={{ paddingLeft: "28px" }}>
                      <span
                        style={{
                          color: "#6B7280",
                          fontSize: "0.8rem",
                        }}
                      >
                        {sucursal.direccion}
                      </span>
                    </div>
                  )}

                  {/* Teléfono */}
                  {sucursal.telefono && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Phone size={16} color="#9CA3AF" />
                      <span
                        style={{
                          color: "#4B5563",
                          fontSize: "0.85rem",
                        }}
                      >
                        {sucursal.telefono}
                      </span>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div
                    className="d-flex gap-2 mt-3 pt-2 border-top"
                    style={{ borderColor: "#E5E0D8" }}
                  >
                    {canEdit("sucursales") && (
                      <button
                        className="btn d-flex align-items-center gap-1"
                        onClick={() => handleEdit(sucursal)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #E5E0D8",
                          borderRadius: "8px",
                          padding: "0.35rem 0.75rem",
                          color: "#0284C7",
                          fontSize: "0.75rem",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#F0F9FF";
                          e.currentTarget.style.borderColor = "#0284C7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#E5E0D8";
                        }}
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                    )}
                    {canDelete("sucursales") && (
                      <button
                        className="btn d-flex align-items-center gap-1"
                        onClick={() => handleDelete(sucursal)}
                        style={{
                          backgroundColor: "transparent",
                          border: "1px solid #E5E0D8",
                          borderRadius: "8px",
                          padding: "0.35rem 0.75rem",
                          color: "#DC2626",
                          fontSize: "0.75rem",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FEF2F2";
                          e.currentTarget.style.borderColor = "#DC2626";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#E5E0D8";
                        }}
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
}
