// src/pages/pagos/PagosPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { DataTable } from "../../components/ui/DataTable";
import { useCrud } from "../../hooks/useCrud";
import { usePermissions } from "../../hooks/usePermissions";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import type { Pago } from "../../types";

const estadoPagoColors = {
  PENDIENTE: "warning",
  COMPLETADO: "success",
  RECHAZADO: "danger",
  ANULADO: "secondary",
};

export function PagosPage() {
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("");

  const { canCreate } = usePermissions();
  const { data, loading } = useCrud<Pago>({
    fetchFn: getAllPagos,
  });

  const filteredData = data.filter((item) => {
    if (filtroEstado !== "TODOS" && item.estado !== filtroEstado) return false;
    if (filtroMetodo && item.metodoPago !== filtroMetodo) return false;
    return true;
  });

  const columns = [
    { key: "idPago", label: "ID" },
    { key: "idEncomienda", label: "Nro. Encomienda" },
    {
      key: "monto",
      label: "Monto",
      render: (row: Pago) => `Bs. ${row.monto.toFixed(2)}`,
    },
    {
      key: "metodoPago",
      label: "Método",
      render: (row: Pago) => row.metodoPago.replace("_", " "),
    },
    { key: "referencia", label: "Referencia" },
    {
      key: "estado",
      label: "Estado",
      render: (row: Pago) => (
        <span className={`badge bg-${estadoPagoColors[row.estado]}`}>
          {row.estado}
        </span>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (row: Pago) => new Date(row.fecha).toLocaleDateString(),
    },
  ];

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Pagos"
        subtitle="Historial de pagos de encomiendas"
        action={
          canCreate("pagos") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/pagos/nuevo")}
            >
              + Nuevo Pago
            </button>
          )
        }
      />

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <select
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="COMPLETADO">Completado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="ANULADO">Anulado</option>
              </select>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={filtroMetodo}
                onChange={(e) => setFiltroMetodo(e.target.value)}
              >
                <option value="">Todos los métodos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="QR">QR</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            onEdit={(row) => navigate(`/encomiendas/${row.idEncomienda}`)}
            canEdit={true}
            getId={(row) => row.idPago}
          />
        </div>
      </div>
    </div>
  );
}
