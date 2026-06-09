// src/components/ui/DataTable.tsx
// src/components/ui/DataTable.tsx
import type { ReactNode } from "react";
import { Spinner } from "./Spinner";

interface Column<T = any> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  getId?: (row: T) => number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  getId = (row) => row.idCliente || row.idConsignatario || row.idSucursal,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner text="Cargando datos..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">No hay registros disponibles</p>
      </div>
    );
  }

  const hasActions = (onEdit && canEdit) || (onDelete && canDelete);

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="text-center" style={{ width: "120px" }}>
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const id = getId(row);
            const isDeleted =
              row.eliminadoEn !== null && row.eliminadoEn !== undefined;

            return (
              <tr
                key={id || idx}
                className={isDeleted ? "table-secondary" : ""}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      {onEdit && canEdit && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => onEdit(row)}
                          disabled={isDeleted}
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && canDelete && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => onDelete(row)}
                          disabled={isDeleted}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
