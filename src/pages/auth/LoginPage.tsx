import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { login as apiLogin } from "../../api/endpoints/auth.api";
import { Mail, Lock, Eye, EyeOff, RefreshCw, Package } from "lucide-react";

// ── Esquema de validación ──────────────────────────────────────────────────────
const schema = yup.object({
  email: yup.string().email("Email inválido").required("El email es requerido"),
  password: yup
    .string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es requerida"),
  captcha: yup.string().required("Ingresa el CAPTCHA"),
});

type FormData = yup.InferType<typeof schema>;

// ── Helper: genera texto CAPTCHA ───────────────────────────────────────────────
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// ── Componente CAPTCHA visual rediseñado ──────────────────────────────────────────────────
function CaptchaDisplay({ text }: { text: string }) {
  const rotations = [-6, 4, -3, 5, -4, 3];
  return (
    <div
      className="d-flex align-items-center justify-content-center gap-2 rounded px-3 py-2 user-select-none w-100"
      style={{
        background:
          "repeating-linear-gradient(45deg, #f0f0f0 0px, #f0f0f0 2px, #e8e8e8 2px, #e8e8e8 4px)",
        fontFamily: "'Courier New', 'Fira Code', monospace",
        fontSize: "1.5rem",
        fontWeight: 700,
        letterSpacing: "0.2em",
        border: "1px solid #D1D5DB",
        borderRadius: "12px",
        minHeight: "56px",
      }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `rotate(${rotations[i]}deg) scaleY(${i % 2 === 0 ? 1 : 0.95})`,
            color:
              i % 3 === 0 ? "#8B1A1A" : i % 3 === 1 ? "#D4A017" : "#1A1A1A",
            textShadow: "1px 1px 0 rgba(0,0,0,0.05)",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

// ── LoginPage Rediseñada ──────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaText, setCaptchaText] = useState(generateCaptcha);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const refreshCaptcha = () => setCaptchaText(generateCaptcha());

  const onSubmit = async (data: FormData) => {
    // Validar CAPTCHA (case-sensitive)
    if (data.captcha !== captchaText) {
      setError("captcha", { message: "CAPTCHA incorrecto" });
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiLogin(data.email, data.password);
      await login(res.token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Credenciales incorrectas";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-100"
      style={{ maxWidth: "440px", animation: "fadeIn 0.4s ease" }}
    >
      <div
        className="card border-0"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Header del card */}
        <div className="text-center pt-5 px-4 pb-3">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              backgroundColor: "rgba(139, 26, 26, 0.08)",
              borderRadius: "16px",
              width: "64px",
              height: "64px",
            }}
          >
            <Package size={32} color="#8B1A1A" />
          </div>
          <h3
            className="fw-bold mb-2"
            style={{
              color: "#1A1A1A",
              fontSize: "1.5rem",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Bienvenido
          </h3>
          <p style={{ color: "#6B7280", fontSize: "0.85rem", margin: 0 }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Body del formulario */}
        <div className="card-body px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-2"
                style={{ color: "#374151", fontSize: "0.8rem" }}
              >
                Correo electrónico
              </label>
              <div className="position-relative">
                <div
                  className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3"
                  style={{ pointerEvents: "none" }}
                >
                  <Mail size={18} color="#9CA3AF" />
                </div>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="usuario@empresa.com"
                  style={{
                    paddingLeft: "40px",
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "48px",
                    fontSize: "0.85rem",
                  }}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <div
                  className="invalid-feedback d-block mt-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  {errors.email.message}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-2"
                style={{ color: "#374151", fontSize: "0.8rem" }}
              >
                Contraseña
              </label>
              <div className="position-relative">
                <div
                  className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3"
                  style={{ pointerEvents: "none" }}
                >
                  <Lock size={18} color="#9CA3AF" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "48px",
                    fontSize: "0.85rem",
                  }}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center justify-content-center border-0 bg-transparent"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ width: "44px", zIndex: 2 }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6B7280" />
                  ) : (
                    <Eye size={18} color="#6B7280" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div
                  className="invalid-feedback d-block mt-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* CAPTCHA */}
            <div className="mb-4">
              <label
                className="form-label fw-semibold mb-2"
                style={{ color: "#374151", fontSize: "0.8rem" }}
              >
                Verificación de seguridad
              </label>
              <div className="d-flex gap-2 mb-2">
                <CaptchaDisplay text={captchaText} />
                <button
                  type="button"
                  className="btn d-flex align-items-center justify-content-center flex-shrink-0"
                  onClick={refreshCaptcha}
                  title="Refrescar CAPTCHA"
                  style={{
                    backgroundColor: "#F8F5F0",
                    border: "1px solid #E5E0D8",
                    borderRadius: "10px",
                    width: "48px",
                    height: "56px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#E5E0D8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8F5F0";
                  }}
                >
                  <RefreshCw size={18} color="#6B7280" />
                </button>
              </div>
              <input
                type="text"
                className={`form-control ${errors.captcha ? "is-invalid" : ""}`}
                placeholder="Escribe los caracteres que ves"
                style={{
                  borderRadius: "10px",
                  borderColor: "#E5E0D8",
                  height: "48px",
                  fontSize: "0.85rem",
                }}
                {...register("captcha")}
                autoComplete="off"
              />
              {errors.captcha && (
                <div
                  className="invalid-feedback d-block mt-1"
                  style={{ fontSize: "0.7rem" }}
                >
                  {errors.captcha.message}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn w-100 fw-semibold"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#8B1A1A",
                border: "none",
                color: "#FFFFFF",
                borderRadius: "10px",
                height: "48px",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5C0E0E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B1A1A";
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    style={{
                      borderColor: "#FFFFFF",
                      borderRightColor: "transparent",
                    }}
                  />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          className="card-footer text-center bg-transparent py-4"
          style={{ borderTop: "1px solid #F0EDE8" }}
        >
          <small style={{ color: "#6B7280" }}>
            ¿No tienes cuenta?{" "}
            <Link
              to="/registro"
              className="fw-semibold text-decoration-none"
              style={{ color: "#8B1A1A" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#D4A017";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8B1A1A";
              }}
            >
              Regístrate aquí
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
