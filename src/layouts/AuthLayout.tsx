import { Outlet } from "react-router-dom";
import { Package, Shield, Zap, BarChart3 } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex">
      {/* Panel izquierdo - solo visible en desktop */}
      <div
        className="d-none d-lg-flex flex-column justify-content-between"
        style={{
          width: "60%",
          background: "linear-gradient(135deg, #1A1A1A 0%, #8B1A1A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Patrón decorativo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 40%, rgba(212, 160, 23, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
            `,
            pointerEvents: "none",
          }}
        />

        <div className="position-relative z-1 p-5" style={{ zIndex: 1 }}>
          {/* Logo */}
          <div className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Package size={40} color="#D4A017" strokeWidth={1.5} />
              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  margin: 0,
                }}
              >
                Expreso Tupiza
              </h1>
            </div>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9rem",
                marginLeft: "52px",
              }}
            >
              Sistema de Gestión de Encomiendas
            </p>
          </div>

          {/* Tagline y beneficios */}
          <div className="mt-5 pt-4">
            <h2
              style={{
                color: "#FFFFFF",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                lineHeight: 1.2,
              }}
            >
              Gestión inteligente
              <br />
              de encomiendas
            </h2>
            <div className="mt-4">
              {/* Beneficio 1 */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  style={{
                    backgroundColor: "rgba(212, 160, 23, 0.15)",
                    borderRadius: "12px",
                    padding: "10px",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={24} color="#D4A017" />
                </div>
                <div>
                  <h6 style={{ color: "#FFFFFF", marginBottom: "4px" }}>
                    Seguridad Garantizada
                  </h6>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.85rem",
                      margin: 0,
                    }}
                  >
                    Tus encomiendas y datos protegidos en todo momento
                  </p>
                </div>
              </div>

              {/* Beneficio 2 */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  style={{
                    backgroundColor: "rgba(212, 160, 23, 0.15)",
                    borderRadius: "12px",
                    padding: "10px",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={24} color="#D4A017" />
                </div>
                <div>
                  <h6 style={{ color: "#FFFFFF", marginBottom: "4px" }}>
                    Velocidad y Eficiencia
                  </h6>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.85rem",
                      margin: 0,
                    }}
                  >
                    Procesos rápidos y optimizados para tu negocio
                  </p>
                </div>
              </div>

              {/* Beneficio 3 */}
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    backgroundColor: "rgba(212, 160, 23, 0.15)",
                    borderRadius: "12px",
                    padding: "10px",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BarChart3 size={24} color="#D4A017" />
                </div>
                <div>
                  <h6 style={{ color: "#FFFFFF", marginBottom: "4px" }}>
                    Control Total
                  </h6>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: "0.85rem",
                      margin: 0,
                    }}
                  >
                    Reportes y estadísticas en tiempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="position-relative z-1 p-5" style={{ zIndex: 1 }}>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "0.75rem",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Expreso Tupiza. Todos los derechos
            reservados.
          </p>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          width: "100%",
          backgroundColor: "#F8F5F0",
          minHeight: "100vh",
        }}
      >
        <div
          className="w-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            maxWidth: "100%",
            padding: "1.5rem",
          }}
        >
          {/* Logo mobile - solo visible en mobile */}
          <div className="d-block d-lg-none text-center mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <Package size={32} color="#8B1A1A" strokeWidth={1.5} />
              <h2
                style={{
                  color: "#1A1A1A",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Expreso Tupiza
              </h2>
            </div>
            <p style={{ color: "#6B7280", fontSize: "0.75rem", margin: 0 }}>
              Sistema de Gestión de Encomiendas
            </p>
          </div>

          <Outlet />
        </div>
      </div>

      <style>{`
        .z-1 {
          z-index: 1;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
