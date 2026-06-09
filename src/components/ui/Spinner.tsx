// src/components/ui/Spinner.tsx
interface SpinnerProps {
  fullPage?: boolean;
  text?: string;
}

export function Spinner({
  fullPage = false,
  text = "Cargando...",
}: SpinnerProps) {
  const spinner = (
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <p className="text-muted">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
