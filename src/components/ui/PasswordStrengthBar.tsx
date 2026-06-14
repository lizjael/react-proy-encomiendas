import {
  getPasswordStrength,
  getStrengthPercent,
} from "../../utils/passwordStrength";

interface Props {
  password: string;
}

const strengthLevels = {
  Débil: { color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" },
  Básica: { color: "#F97316", bg: "rgba(249, 115, 22, 0.1)" },
  Media: { color: "#D4A017", bg: "rgba(212, 160, 23, 0.1)" },
  Fuerte: { color: "#16A34A", bg: "rgba(22, 163, 74, 0.1)" },
};

export function PasswordStrengthBar({ password }: Props) {
  const strength = getPasswordStrength(password);
  const percent = getStrengthPercent(strength);
  const levelInfo =
    strengthLevels[strength as keyof typeof strengthLevels] ||
    strengthLevels.Débil;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div
        className="progress rounded-pill"
        style={{
          height: "6px",
          backgroundColor: "#E5E0D8",
          overflow: "hidden",
        }}
      >
        <div
          className="progress-bar"
          role="progressbar"
          style={{
            width: `${percent}%`,
            backgroundColor: levelInfo.color,
            transition: "width 0.3s ease, background-color 0.3s ease",
            borderRadius: "3px",
          }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="d-flex align-items-center gap-2 mt-2">
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: levelInfo.color,
          }}
        />
        <small
          style={{
            color: levelInfo.color,
            fontSize: "0.7rem",
            fontWeight: 500,
          }}
        >
          Fortaleza: <strong>{strength}</strong>
        </small>
      </div>
    </div>
  );
}
