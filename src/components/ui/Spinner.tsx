interface SpinnerProps {
  fullPage?: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: "24px", height: "24px", borderWidth: "2px" },
  md: { width: "40px", height: "40px", borderWidth: "3px" },
  lg: { width: "56px", height: "56px", borderWidth: "4px" },
};

export function Spinner({
  fullPage = false,
  text = "Cargando...",
  size = "md",
}: SpinnerProps) {
  const sizes = sizeMap[size];

  const spinner = (
    <div className="text-center">
      <div
        className="spinner-border"
        role="status"
        style={{
          color: "#8B1A1A",
          width: sizes.width,
          height: sizes.height,
          borderWidth: sizes.borderWidth,
        }}
      >
        <span className="visually-hidden">{text}</span>
      </div>
      {text && (
        <p
          className="mt-3 mb-0"
          style={{
            color: "#6B7280",
            fontSize: size === "sm" ? "0.75rem" : "0.85rem",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#F8F5F0",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
