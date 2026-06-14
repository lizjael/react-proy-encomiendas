import type { ReactNode } from "react";
import { Spinner } from "./Spinner";
import { Edit, Trash2, Inbox } from "lucide-react";
import { useState, useMemo } from "react";

interface Column<T = any> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
  mobileHidden?: boolean;
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
  itemsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  getId = (row) =>
    row.idCliente || row.idConsignatario || row.idSucursal || row.id,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage],
  );
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner text="Cargando datos..." />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="text-center py-5"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #E5E0D8",
        }}
      >
        <Inbox
          size={48}
          color="#9CA3AF"
          className="mb-3"
          style={{ opacity: 0.5 }}
        />
        <p className="mb-0" style={{ color: "#6B7280" }}>
          No hay registros disponibles
        </p>
        <small style={{ color: "#9CA3AF" }}>
          Los datos aparecerán aquí cuando los agregues
        </small>
      </div>
    );
  }

  const hasActions = (onEdit && canEdit) || (onDelete && canDelete);

  return (
    <>
      <div className="table-responsive">
        <table
          className="table align-middle mb-0"
          style={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%",
          }}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.className || ""} ${col.mobileHidden ? "d-none d-md-table-cell" : ""}`}
                  style={{
                    backgroundColor: "#1A1A1A",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "0.875rem 1rem",
                    borderBottom: `2px solid #D4A017`,
                  }}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th
                  className="text-center"
                  style={{
                    backgroundColor: "#1A1A1A",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "0.875rem 1rem",
                    borderBottom: `2px solid #D4A017`,
                    width: "100px",
                  }}
                >
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => {
              const id = getId(row);
              const isDeleted =
                row.eliminadoEn !== null && row.eliminadoEn !== undefined;

              return (
                <tr
                  key={id || idx}
                  style={{
                    backgroundColor: isDeleted
                      ? "#FEF2F2"
                      : idx % 2 === 0
                        ? "#FFFFFF"
                        : "#FAF8F5",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleted) {
                      e.currentTarget.style.backgroundColor = "#FEF2F2";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleted) {
                      e.currentTarget.style.backgroundColor =
                        idx % 2 === 0 ? "#FFFFFF" : "#FAF8F5";
                    }
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.mobileHidden ? "d-none d-md-table-cell" : ""}`}
                      style={{
                        padding: "0.875rem 1rem",
                        color: isDeleted ? "#9CA3AF" : "#2D2D2D",
                        fontSize: "0.85rem",
                        borderBottom: `1px solid #E5E0D8`,
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {hasActions && (
                    <td
                      className="text-center"
                      style={{
                        padding: "0.875rem 1rem",
                        borderBottom: `1px solid #E5E0D8`,
                      }}
                    >
                      <div className="d-flex gap-2 justify-content-center">
                        {onEdit && canEdit && (
                          <button
                            className="btn p-0"
                            onClick={() => onEdit(row)}
                            disabled={isDeleted}
                            style={{
                              color: "#0284C7",
                              transition: "all 0.2s ease",
                              opacity: isDeleted ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.color = "#0369A1";
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.color = "#0284C7";
                            }}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {onDelete && canDelete && (
                          <button
                            className="btn p-0"
                            onClick={() => onDelete(row)}
                            disabled={isDeleted}
                            style={{
                              color: "#DC2626",
                              transition: "all 0.2s ease",
                              opacity: isDeleted ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.color = "#B91C1C";
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.color = "#DC2626";
                            }}
                          >
                            <Trash2 size={18} />
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <small style={{ color: "#6B7280" }}>
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, data.length)} de {data.length}{" "}
            registros
          </small>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    color: "#8B1A1A",
                    borderRadius: "8px",
                    margin: "0 2px",
                  }}
                >
                  Anterior
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                      style={
                        currentPage === page
                          ? {
                              backgroundColor: "#8B1A1A",
                              borderColor: "#8B1A1A",
                              color: "#FFFFFF",
                              borderRadius: "8px",
                              margin: "0 2px",
                            }
                          : {
                              color: "#8B1A1A",
                              borderRadius: "8px",
                              margin: "0 2px",
                            }
                      }
                    >
                      {page}
                    </button>
                  </li>
                ),
              )}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    color: "#8B1A1A",
                    borderRadius: "8px",
                    margin: "0 2px",
                  }}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
