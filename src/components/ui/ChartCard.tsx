import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`h-100 ${className}`}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid #E5E0D8",
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          borderTop: `3px solid #8B1A1A`,
          padding: "1rem 1.25rem 0 1.25rem",
        }}
      >
        <h5
          className="mb-0 fw-semibold"
          style={{
            color: "#1A1A1A",
            fontSize: "0.95rem",
            letterSpacing: "-0.2px",
          }}
        >
          {title}
        </h5>
        {subtitle && (
          <small
            className="mt-1 d-block"
            style={{
              color: "#6B7280",
              fontSize: "0.7rem",
            }}
          >
            {subtitle}
          </small>
        )}
      </div>
      <div className="p-3" style={{ padding: "1rem 1.25rem 1.25rem 1.25rem" }}>
        {children}
      </div>
    </div>
  );
}
