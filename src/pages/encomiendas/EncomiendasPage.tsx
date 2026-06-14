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
import { Package, Plus, Search, ChevronRight } from "lucide-react";

const estadoEntregaConfig = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.1)",
  },
  EN_TRANSITO: {
    label: "En Tránsito",
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.1)",
  },
  ENTREGADO: {
    label: "Entregado",
    color: "#16A34A",
    bg: "rgba(22, 163, 74, 0.1)",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
};

const estadoPagoConfig = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.1)",
  },
  COMPLETADO: {
    label: "Completado",
    color: "#16A34A",
    bg: "rgba(22, 163, 74, 0.1)",
  },
  RECHAZADO: {
    label: "Rechazado",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
  },
  ANULADO: {
    label: "Anulado",
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.1)",
  },
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
      mobileHidden: true,
    },
    {
      key: "ruta",
      label: "Origen → Destino",
      render: (row: Encomienda) => (
        <div className="d-flex align-items-center gap-1">
          <span className="text-truncate" style={{ maxWidth: "100px" }}>
            {row.sucursalOrigen?.nombre || "N/A"}
          </span>
          <ChevronRight size={14} color="#9CA3AF" />
          <span className="text-truncate" style={{ maxWidth: "100px" }}>
            {row.sucursalDestino?.nombre || "N/A"}
          </span>
        </div>
      ),
      mobileHidden: true,
    },
    {
      key: "estadoEntrega",
      label: "Estado Entrega",
      render: (row: Encomienda) => {
        const config = estadoEntregaConfig[row.estadoEntrega] ?? {
          label: row.estadoEntrega,
          color: "#6B7280",
          bg: "rgba(107, 114, 128, 0.1)",
        };
        return (
          <select
            className="form-select form-select-sm"
            value={row.estadoEntrega}
            onChange={(e) =>
              handleUpdateEstado(row, e.target.value as EstadoEntrega)
            }
            disabled={!canEdit("encomiendas")}
            style={{
              backgroundColor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}30`,
              fontWeight: 500,
              fontSize: "0.75rem",
              width: "130px",
              borderRadius: "20px",
              padding: "0.25rem 0.75rem",
            }}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_TRANSITO">En Tránsito</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        );
      },
    },
    {
      key: "estadoPago",
      label: "Estado Pago",
      render: (row: Encomienda) => {
        const config = estadoPagoConfig[row.estadoPago] ?? {
          label: row.estadoPago,
          color: "#6B7280",
          bg: "rgba(107, 114, 128, 0.1)",
        };
        return (
          <span
            className="badge rounded-pill px-3 py-1"
            style={{
              backgroundColor: config.bg,
              color: config.color,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            {config.label}
          </span>
        );
      },
      mobileHidden: true,
    },
    {
      key: "costoTotal",
      label: "Costo Total",
      render: (row: Encomienda) => (
        <span className="fw-semibold" style={{ color: "#1A1A1A" }}>
          Bs. {Number(row.costoTotal).toFixed(2)}
        </span>
      ),
      mobileHidden: true,
    },
    {
      key: "fechaEmision",
      label: "Fecha Emisión",
      render: (row: Encomienda) =>
        new Date(row.fechaEmision).toLocaleDateString(),
      mobileHidden: true,
    },
  ];

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Encomiendas"
        subtitle="Gestión de envíos y seguimiento"
        icon={<Package size={24} />}
        action={
          canCreate("encomiendas") && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => navigate("/encomiendas/nueva")}
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
              Nueva Encomienda
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
          <div className="row g-3">
            <div className="col-md-5">
              <div className="position-relative">
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
                  placeholder="Buscar por número de guía..."
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
            <div className="col-md-3">
              <select
                className="form-select"
                value={filtroEntrega}
                onChange={(e) => setFiltroEntrega(e.target.value as any)}
                style={{
                  borderRadius: "10px",
                  borderColor: "#E5E0D8",
                  height: "42px",
                  fontSize: "0.85rem",
                }}
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
                style={{
                  borderRadius: "10px",
                  borderColor: "#E5E0D8",
                  height: "42px",
                  fontSize: "0.85rem",
                }}
              >
                <option value="TODOS">Todos los estados de pago</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADO">Completado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="ANULADO">Anulado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-0">
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
