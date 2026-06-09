import {
  getPasswordStrength,
  getStrengthColor,
  getStrengthPercent,
} from "../../utils/passwordStrength";

interface Props {
  password: string;
}

export function PasswordStrengthBar({ password }: Props) {
  const strength = getPasswordStrength(password);
  const color = getStrengthColor(strength);
  const percent = getStrengthPercent(strength);

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="progress" style={{ height: "6px" }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${percent}%`, transition: "width 0.3s ease" }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <small className={`text-${color} mt-1 d-inline-block`}>
        Contraseña: <strong>{strength}</strong>
      </small>
    </div>
  );
}
