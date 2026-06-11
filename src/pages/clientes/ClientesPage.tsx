// src/pages/clientes/ClientesPage.tsx
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
import { ClienteSearchInput } from "../../components/forms/ClienteSearchInput";

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
    { key: "idCliente", label: "ID", className: "text-center" },
    {
      key: "tipoCliente",
      label: "Tipo",
      render: (row: Cliente) => {
        const tipo = row.tipoCliente?.toUpperCase();
        const esEmpresa =
          tipo === "JURIDICO" || tipo === "EMPRESA" || tipo === "EMPRESARIAL";
        return (
          <span className={`badge ${esEmpresa ? "bg-primary" : "bg-info"}`}>
            {esEmpresa ? "Empresa" : "Persona"}
          </span>
        );
      },
    },
    { key: "nombreRazonSocial", label: "Nombre/Razón Social" },
    { key: "ci", label: "CI" },
    { key: "nit", label: "NIT" },
    { key: "telefono", label: "Teléfono" },
    { key: "direccion", label: "Dirección" },
    {
      key: "estado",
      label: "Estado",
      render: (row: Cliente) =>
        row.eliminadoEn ? (
          <span className="badge bg-danger">Eliminado</span>
        ) : (
          <span className="badge bg-success">Activo</span>
        ),
    },
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
        action={
          canCreate("clientes") && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedItem(undefined);
                setShowModal(true);
              }}
            >
              + Nuevo Cliente
            </button>
          )
        }
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <ClienteSearchInput
              onSelect={(cliente) => {
                setSearchTerm(cliente.nombreRazonSocial);
                // Aquí podrías redirigir o seleccionar el cliente
              }}
              placeholder="Buscar cliente por CI, NIT o nombre..."
            />
          </div>

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
