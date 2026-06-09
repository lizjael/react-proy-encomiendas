// src/components/ui/ChartCard.tsx
// src/components/ui/ChartCard.tsx
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <div className={`card shadow-sm h-100 ${className}`}>
      <div className="card-header bg-white">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
