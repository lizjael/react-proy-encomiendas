import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* Patrón decorativo sutil */}
      <div
        className="position-fixed w-100 h-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,179,237,0.05) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Contenido principal centrado */}
      <main
        className="flex-grow-1 d-flex align-items-center justify-content-center position-relative"
        style={{ zIndex: 1 }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="text-center py-3 position-relative"
        style={{ zIndex: 1 }}
      >
        <small className="text-white-50">
          Sistema de Gestión de Encomiendas &copy; {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}
