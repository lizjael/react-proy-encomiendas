// src/pages/encomiendas/EncomiendasPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getAllEncomiendas,
  deleteEncomienda,
  updateEncomienda,
} from "../../api/endpoints/encomiendas.api";
import type { Encomienda, EstadoEntrega, EstadoPago } from "../../types";
import { toast } from "react-toastify";

const estadoEntregaColors = {
  PENDIENTE: "warning",
  EN_TRANSITO: "info",
  ENTREGADO: "success",
  CANCELADO: "secondary",
};

const estadoPagoColors = {
  PENDIENTE: "warning",
  COMPLETADO: "success",
  RECHAZADO: "danger",
  ANULADO: "secondary",
};

export function EncomiendasPage() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Encomienda | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEntrega, setFiltroEntrega] = useState<EstadoEntrega | "TODOS">(
    "TODOS",
  );
  const [filtroPago, setFiltroPago] = useState<EstadoPago | "TODOS">("TODOS");

  const { canCreate, canEdit, canDelete } = usePermissions();
  const { data, loading, refresh, deleteItem } = useCrud<Encomienda>({
    fetchFn: getAllEncomiendas,
    deleteFn: deleteEncomienda,
  });

  const filteredData = data.filter((item) => {
    if (
      searchTerm &&
      !item.nroGuia.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (filtroEntrega !== "TODOS" && item.estadoEntrega !== filtroEntrega) {
      return false;
    }
    if (filtroPago !== "TODOS" && item.estadoPago !== filtroPago) {
      return false;
    }
    return true;
  });

  const handleUpdateEstado = async (
    item: Encomienda,
    nuevoEstado: EstadoEntrega,
  ) => {
    try {
      await updateEncomienda(item.idEncomienda, { estadoEntrega: nuevoEstado });
      toast.success("Estado actualizado correctamente");
      refresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar estado",
      );
    }
  };

  const columns = [
    { key: "nroGuia", label: "Nro. Guía" },
    {
      key: "cliente",
      label: "Cliente",
      render: (row: Encomienda) => row.cliente?.nombreRazonSocial || "-",
    },
    {
      key: "consignatario",
      label: "Consignatario",
      render: (row: Encomienda) => row.consignatario?.nombres || "-",
    },
    {
      key: "ruta",
      label: "Origen → Destino",
      render: (row: Encomienda) =>
        `${row.sucursalOrigen?.nombre || "N/A"} → ${row.sucursalDestino?.nombre || "N/A"}`,
    },
    {
      key: "estadoEntrega",
      label: "Estado Entrega",
      render: (row: Encomienda) => (
        <select
          className={`form-select form-select-sm bg-${estadoEntregaColors[row.estadoEntrega]} bg-opacity-25`}
          style={{ width: "130px" }}
          value={row.estadoEntrega}
          onChange={(e) =>
            handleUpdateEstado(row, e.target.value as EstadoEntrega)
          }
          disabled={!canEdit("encomiendas")}
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_TRANSITO">En Tránsito</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      ),
    },
    {
      key: "estadoPago",
      label: "Estado Pago",
      render: (row: Encomienda) => (
        <span className={`badge bg-${estadoPagoColors[row.estadoPago]}`}>
          {row.estadoPago}
        </span>
      ),
    },
    {
      key: "costoTotal",
      label: "Costo Total",
      render: (row: Encomienda) => `Bs. ${row.costoTotal.toFixed(2)}`,
    },
    {
      key: "fechaEmision",
      label: "Fecha Emisión",
      render: (row: Encomienda) =>
        new Date(row.fechaEmision).toLocaleDateString(),
    },
  ];

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Encomiendas"
        subtitle="Gestión de envíos y seguimiento"
        action={
          canCreate("encomiendas") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/encomiendas/nueva")}
            >
              + Nueva Encomienda
            </button>
          )
        }
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número de guía..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroEntrega}
                onChange={(e) => setFiltroEntrega(e.target.value as any)}
              >
                <option value="TODOS">Todos los estados de entrega</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_TRANSITO">En Tránsito</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroPago}
                onChange={(e) => setFiltroPago(e.target.value as any)}
              >
                <option value="TODOS">Todos los estados de pago</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADO">Completado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="ANULADO">Anulado</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            onEdit={(row) => navigate(`/encomiendas/${row.idEncomienda}`)}
            onDelete={
              canDelete("encomiendas")
                ? (row) => {
                    setSelectedItem(row);
                    setShowConfirm(true);
                  }
                : undefined
            }
            canEdit={true}
            canDelete={canDelete("encomiendas")}
            getId={(row) => row.idEncomienda}
          />
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        title="Eliminar Encomienda"
        message={`¿Estás seguro de eliminar la encomienda "${selectedItem?.nroGuia}"?`}
        onConfirm={async () => {
          if (selectedItem) {
            await deleteItem(selectedItem.idEncomienda);
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
