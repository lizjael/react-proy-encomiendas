import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1050,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "400px" }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          <div className="modal-body p-4 text-center">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{
                backgroundColor: "rgba(212, 160, 23, 0.1)",
                width: "64px",
                height: "64px",
              }}
            >
              <AlertTriangle size={32} color="#D4A017" />
            </div>
            <h5
              className="mb-2 fw-semibold"
              style={{
                color: "#1A1A1A",
                fontSize: "1.25rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {title}
            </h5>
            <p
              className="mb-0"
              style={{
                color: "#6B7280",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>
          <div
            className="modal-footer p-3"
            style={{
              backgroundColor: "#F8F5F0",
              borderTop: "1px solid #E5E0D8",
            }}
          >
            <button
              type="button"
              className="btn"
              onClick={onCancel}
              disabled={loading}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #D1D5DB",
                color: "#374151",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F3F4F6";
                e.currentTarget.style.borderColor = "#9CA3AF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "#D1D5DB";
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn"
              onClick={onConfirm}
              disabled={loading}
              style={{
                backgroundColor: "#8B1A1A",
                border: "none",
                color: "#FFFFFF",
                borderRadius: "8px",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5C0E0E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B1A1A";
              }}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
