// src/components/ui/RoleBadge.tsx
import type { Role } from "../../types";

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = {
    user: { label: "Empleado", variant: "secondary" },
    admin: { label: "Administrador", variant: "primary" },
    super_admin: { label: "Super Administrador", variant: "danger" },
  };

  const { label, variant } = config[role];

  return <span className={`badge bg-${variant} px-3 py-2`}>{label}</span>;
}
