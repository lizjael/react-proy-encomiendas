import { type ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "primary" | "success" | "warning" | "danger" | "info";
  subtitle?: string;
}

const colorMap = {
  primary: { border: "#8B1A1A", bg: "rgba(139, 26, 26, 0.08)" },
  success: { border: "#16A34A", bg: "rgba(22, 163, 74, 0.08)" },
  warning: { border: "#D4A017", bg: "rgba(212, 160, 23, 0.08)" },
  danger: { border: "#DC2626", bg: "rgba(220, 38, 38, 0.08)" },
  info: { border: "#0284C7", bg: "rgba(2, 132, 199, 0.08)" },
};

export function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <div
      className="h-100"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease",
        borderTopLeftRadius: "12px",
        borderBottomLeftRadius: "12px",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          borderLeft: `4px solid ${colors.border}`,
          padding: "1.25rem",
          height: "100%",
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6
              className="mb-2 text-uppercase fw-semibold"
              style={{
                color: "#6B7280",
                fontSize: "0.7rem",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </h6>
            <h2
              className="mb-0 fw-bold"
              style={{
                color: "#1A1A1A",
                fontSize: "1.75rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {value}
            </h2>
            {subtitle && (
              <small
                className="mt-1 d-block"
                style={{ color: "#6B7280", fontSize: "0.7rem" }}
              >
                {subtitle}
              </small>
            )}
          </div>
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              backgroundColor: colors.bg,
              width: "48px",
              height: "48px",
            }}
          >
            <span style={{ color: colors.border, display: "flex" }}>
              {icon}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
