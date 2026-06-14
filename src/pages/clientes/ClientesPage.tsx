import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { ClienteFormModal } from "../../components/forms/ClienteFormModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllClientes,
  deleteCliente,
} from "../../api/endpoints/clientes.api";
import type { Cliente } from "../../types";
import { Users, Search, Plus, Building2, User } from "lucide-react";

export function ClientesPage() {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Cliente | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<Cliente>({
    fetchFn: getAllClientes,
    deleteFn: deleteCliente,
  });

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.ci && item.ci.toLowerCase().includes(searchLower)) ||
      (item.nit && item.nit.toLowerCase().includes(searchLower)) ||
      item.nombreRazonSocial.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (item: Cliente) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: Cliente) => {
    setSelectedItem(item);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      await deleteItem(selectedItem.idCliente);
      setShowConfirm(false);
      setSelectedItem(undefined);
    }
  };

  const handleSave = () => {
    refresh();
  };

  const columns = [
    {
      key: "idCliente",
      label: "ID",
      className: "text-center",
      mobileHidden: true,
    },
    {
      key: "tipoCliente",
      label: "Tipo",
      render: (row: Cliente) => {
        const tipo = row.tipoCliente?.toUpperCase();
        const esEmpresa =
          tipo === "JURIDICO" || tipo === "EMPRESA" || tipo === "EMPRESARIAL";
        return (
          <span
            className="badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
            style={{
              backgroundColor: esEmpresa
                ? "rgba(139, 26, 26, 0.1)"
                : "rgba(212, 160, 23, 0.1)",
              color: esEmpresa ? "#8B1A1A" : "#D4A017",
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {esEmpresa ? <Building2 size={12} /> : <User size={12} />}
            {esEmpresa ? "Empresa" : "Persona"}
          </span>
        );
      },
    },
    { key: "nombreRazonSocial", label: "Nombre/Razón Social" },
    { key: "ci", label: "CI", mobileHidden: true },
    { key: "nit", label: "NIT", mobileHidden: true },
    { key: "telefono", label: "Teléfono", mobileHidden: true },
    { key: "direccion", label: "Dirección", mobileHidden: true },
  ];

  if (!canView("clientes")) {
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
        title="Clientes"
        subtitle="Gestión de clientes y personas jurídicas"
        icon={<Users size={24} />}
        action={
          canCreate("clientes") && (
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
              Nuevo Cliente
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
              placeholder="Buscar por CI, NIT o nombre..."
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
            onEdit={canEdit("clientes") ? handleEdit : undefined}
            onDelete={canDelete("clientes") ? handleDelete : undefined}
            canEdit={canEdit("clientes")}
            canDelete={canDelete("clientes")}
            getId={(row) => row.idCliente}
          />
        </div>
      </div>

      <ClienteFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        item={selectedItem}
        onSaved={handleSave}
      />

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar al cliente "${selectedItem?.nombreRazonSocial}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirm(false);
          setSelectedItem(undefined);
        }}
      />
    </div>
  );
}
