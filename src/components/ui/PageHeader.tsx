import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  action,
  children,
}: PageHeaderProps) {
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          {icon && (
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(139, 26, 26, 0.08)",
                width: "48px",
                height: "48px",
              }}
            >
              <span style={{ color: "#8B1A1A", display: "flex" }}>{icon}</span>
            </div>
          )}
          <div>
            <h1
              className="mb-1 fw-bold"
              style={{
                color: "#1A1A1A",
                fontSize: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mb-0"
                style={{
                  color: "#6B7280",
                  fontSize: "0.85rem",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {(action || children) && (
          <div className="d-flex gap-2 flex-shrink-0">{action || children}</div>
        )}
      </div>
      <hr
        className="mb-4"
        style={{
          backgroundColor: "#E5E0D8",
          height: "1px",
          border: "none",
        }}
      />
    </>
  );
}
