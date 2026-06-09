export type PasswordStrength = "débil" | "intermedio" | "fuerte";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "débil";

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 10 && hasUpper && hasNumber && hasSymbol) {
    return "fuerte";
  }
  if (password.length >= 8 && (hasNumber || hasUpper)) {
    return "intermedio";
  }
  return "débil";
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "fuerte":
      return "success";
    case "intermedio":
      return "warning";
    default:
      return "danger";
  }
}

export function getStrengthPercent(strength: PasswordStrength): number {
  switch (strength) {
    case "fuerte":
      return 100;
    case "intermedio":
      return 60;
    default:
      return 25;
  }
}
