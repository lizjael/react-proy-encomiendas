import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { KPICard } from "../../components/ui/KPICard";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import type { Pago, Encomienda } from "../../types";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Calendar,
} from "lucide-react";

const estadoPagoConfig = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.1)",
    icon: Clock,
  },
  COMPLETADO: {
    label: "Completado",
    color: "#16A34A",
    bg: "rgba(22, 163, 74, 0.1)",
    icon: CheckCircle,
  },
  RECHAZADO: {
    label: "Rechazado",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
    icon: XCircle,
  },
  ANULADO: {
    label: "Anulado",
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.1)",
    icon: XCircle,
  },
};

const metodoPagoLabels: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA_CREDITO: "Tarjeta Crédito",
  TARJETA_DEBITO: "Tarjeta Débito",
  TRANSFERENCIA: "Transferencia",
  QR: "QR",
  DEPOSITO_BANCARIO: "Depósito Bancario",
  MERCADO_PAGO: "Mercado Pago",
  YAPE: "Yape",
  PLIN: "Plin",
};

export function PagosPage() {
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const { canCreate } = usePermissions();
  const { data: pagos, loading: pagosLoading } = useCrud<Pago>({
    fetchFn: getAllPagos,
  });
  const { data: encomiendas } = useCrud<Encomienda>({
    fetchFn: getAllEncomiendas,
  });

  // Crear mapa de encomienda ID a número de guía
  const encomiendaMap = useMemo(() => {
    const map = new Map<number, string>();
    encomiendas.forEach((enc) => {
      map.set(enc.idEncomienda, enc.nroGuia);
    });
    return map;
  }, [encomiendas]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    const totalRecaudado = pagos
      .filter((p) => p.estado === "COMPLETADO")
      .reduce((sum, p) => sum + p.monto, 0);
    const pagosPendientes = pagos.filter(
      (p) => p.estado === "PENDIENTE",
    ).length;
    const pagosCompletados = pagos.filter(
      (p) => p.estado === "COMPLETADO",
    ).length;
    return { totalRecaudado, pagosPendientes, pagosCompletados };
  }, [pagos]);

  // Filtrar datos
  const filteredData = pagos.filter((item) => {
    if (filtroEstado !== "TODOS" && item.estado !== filtroEstado) return false;
    if (filtroMetodo && item.metodoPago !== filtroMetodo) return false;
    if (searchTerm) {
      const nroGuia = encomiendaMap.get(item.idEncomienda) || "";
      if (!nroGuia.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
    }
    if (fechaDesde) {
      const fechaPago = new Date(item.fecha);
      const desde = new Date(fechaDesde);
      if (fechaPago < desde) return false;
    }
    if (fechaHasta) {
      const fechaPago = new Date(item.fecha);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59);
      if (fechaPago > hasta) return false;
    }
    return true;
  });

  const columns = [
    {
      key: "idPago",
      label: "ID",
      className: "text-center",
      mobileHidden: true,
    },
    {
      key: "idEncomienda",
      label: "Encomienda",
      render: (row: Pago) => {
        const nroGuia = encomiendaMap.get(row.idEncomienda);
        return (
          <button
            onClick={() => navigate(`/encomiendas/${row.idEncomienda}`)}
            className="btn p-0 fw-semibold"
            style={{ color: "#8B1A1A" }}
          >
            {nroGuia || `#${row.idEncomienda}`}
          </button>
        );
      },
    },
    {
      key: "monto",
      label: "Monto",
      render: (row: Pago) => (
        <span className="fw-semibold" style={{ color: "#1A1A1A" }}>
          Bs. {Number(row.monto).toFixed(2)}
        </span>
      ),
    },
    {
      key: "metodoPago",
      label: "Método",
      render: (row: Pago) => (
        <div className="d-flex align-items-center gap-2">
          <CreditCard size={14} color="#9CA3AF" />
          <span style={{ fontSize: "0.85rem" }}>
            {metodoPagoLabels[row.metodoPago] ||
              row.metodoPago.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (row: Pago) => {
        const config = estadoPagoConfig[row.estado];
        const Icon = config.icon;
        return (
          <span
            className="badge rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1"
            style={{
              backgroundColor: config.bg,
              color: config.color,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
            <Icon size={12} />
            {config.label}
          </span>
        );
      },
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row: Pago) => new Date(row.fecha).toLocaleDateString(),
      mobileHidden: true,
    },
    {
      key: "referencia",
      label: "Referencia",
      render: (row: Pago) => row.referencia || "-",
      mobileHidden: true,
    },
  ];

  const limpiarFiltros = () => {
    setFiltroEstado("TODOS");
    setFiltroMetodo("");
    setSearchTerm("");
    setFechaDesde("");
    setFechaHasta("");
  };

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Pagos"
        subtitle="Historial de pagos de encomiendas"
        icon={<CreditCard size={24} />}
        action={
          canCreate("pagos") && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => navigate("/pagos/nuevo")}
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
              <DollarSign size={18} />
              Nuevo Pago
            </button>
          )
        }
      />

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-4">
          <KPICard
            title="Total Recaudado"
            value={`Bs. ${kpis.totalRecaudado.toFixed(2)}`}
            icon={<DollarSign size={24} />}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-4">
          <KPICard
            title="Pagos Pendientes"
            value={kpis.pagosPendientes}
            icon={<Clock size={24} />}
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-4">
          <KPICard
            title="Pagos Completados"
            value={kpis.pagosCompletados}
            icon={<CheckCircle size={24} />}
            color="primary"
          />
        </div>
      </div>

      {/* Filtros */}
      <div
        className="rounded-3 mb-4 p-4"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="row g-3">
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Search size={14} className="me-1" />
              Buscar por Guía
            </label>
            <div className="position-relative">
              <Search
                size={16}
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
                placeholder="Número de guía..."
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
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Filter size={14} className="me-1" />
              Estado de Pago
            </label>
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="COMPLETADO">Completado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <CreditCard size={14} className="me-1" />
              Método de Pago
            </label>
            <select
              className="form-select"
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            >
              <option value="">Todos los métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta Débito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="QR">QR</option>
              <option value="DEPOSITO_BANCARIO">Depósito Bancario</option>
              <option value="MERCADO_PAGO">Mercado Pago</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
            </select>
          </div>
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              &nbsp;
            </label>
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={limpiarFiltros}
              style={{
                backgroundColor: "#F8F5F0",
                border: "1px solid #E5E0D8",
                borderRadius: "10px",
                height: "42px",
                color: "#6B7280",
                fontSize: "0.85rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E5E0D8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F5F0";
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Rango de fechas */}
        <div className="row g-3 mt-2">
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Calendar size={14} className="me-1" />
              Fecha Desde
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Calendar size={14} className="me-1" />
              Fecha Hasta
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className="rounded-3 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            loading={pagosLoading}
            onEdit={(row) => navigate(`/encomiendas/${row.idEncomienda}`)}
            canEdit={true}
            getId={(row) => row.idPago}
          />
        </div>
      </div>
    </div>
  );
}
