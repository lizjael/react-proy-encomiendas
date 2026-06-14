import type { Role } from "../../types";

interface RoleBadgeProps {
  role: Role;
}

const roleConfig = {
  super_admin: {
    label: "Super Administrador",
    backgroundColor: "#D4A017",
    color: "#1A1A1A",
  },
  admin: {
    label: "Administrador",
    backgroundColor: "#8B1A1A",
    color: "#FFFFFF",
  },
  user: {
    label: "Empleado",
    backgroundColor: "#4B5563",
    color: "#FFFFFF",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className="d-inline-block fw-semibold text-center"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: 500,
        letterSpacing: "0.3px",
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}
