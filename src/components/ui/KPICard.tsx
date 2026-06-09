// src/components/ui/KPICard.tsx
interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "warning" | "danger" | "info";
  subtitle?: string;
}

export function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h2 className="mb-0">{value}</h2>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`bg-${color} bg-opacity-10 rounded p-3`}>
            <span style={{ fontSize: "24px" }}>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
