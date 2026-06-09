import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { login as apiLogin } from "../../api/endpoints/auth.api";

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

// ── Componente CAPTCHA visual ──────────────────────────────────────────────────
function CaptchaDisplay({ text }: { text: string }) {
  const rotations = [-8, 5, -3, 7, -5, 4];
  return (
    <div
      className="d-flex align-items-center justify-content-center gap-1 rounded px-3 py-2 user-select-none"
      style={{
        background: "linear-gradient(135deg, #e8e8e8, #d0d0d0)",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "1.6rem",
        fontWeight: 700,
        letterSpacing: "0.15em",
        border: "2px dashed #aaa",
        minHeight: "56px",
      }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `rotate(${rotations[i]}deg) scaleY(${i % 2 === 0 ? 1 : 0.9})`,
            color:
              i % 3 === 0 ? "#1a1a6e" : i % 3 === 1 ? "#6e1a1a" : "#1a6e1a",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

// ── LoginPage ──────────────────────────────────────────────────────────────────
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
    <div className="w-100" style={{ maxWidth: "420px" }}>
      {/* Card */}
      <div
        className="card border-0 shadow-lg"
        style={{ borderRadius: "16px", overflow: "hidden" }}
      >
        {/* Header */}
        <div
          className="text-center py-4 px-4"
          style={{ background: "linear-gradient(135deg, #0f3460, #16213e)" }}
        >
          <div className="mb-2" style={{ fontSize: "2.5rem" }}>
            📦
          </div>
          <h4 className="text-white fw-bold mb-0">Gestión de Encomiendas</h4>
          <small className="text-white-50">Inicia sesión para continuar</small>
        </div>

        {/* Body */}
        <div className="card-body p-4">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Correo electrónico
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                placeholder="usuario@empresa.com"
                {...register("email")}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Verificación</label>
              <div className="d-flex align-items-center gap-2 mb-2">
                <CaptchaDisplay text={captchaText} />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={refreshCaptcha}
                  title="Refrescar CAPTCHA"
                >
                  🔄
                </button>
              </div>
              <input
                type="text"
                className={`form-control ${errors.captcha ? "is-invalid" : ""}`}
                placeholder="Escribe los caracteres que ves"
                {...register("captcha")}
                autoComplete="off"
              />
              {errors.captcha && (
                <div className="invalid-feedback">{errors.captcha.message}</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold py-2"
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #0f3460, #16213e)",
                border: "none",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
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
        <div className="card-footer text-center bg-transparent border-top py-3">
          <small className="text-muted">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="fw-semibold text-decoration-none">
              Registrarse
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
