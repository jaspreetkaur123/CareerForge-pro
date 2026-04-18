export default function LoadingSpinner({ size = 28, label = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "60%",
          border: `3px solid var(--surface-2)`,
          borderTopColor: "var(--primary)",
          animation: "spin 0.75s linear infinite",
        }}
      />
      {label && <p style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{label}</p>}
    </div>
  );
}
