// src/components/ui/PageHeader.tsx
// src/components/ui/PageHeader.tsx
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h1 className="h2 mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
