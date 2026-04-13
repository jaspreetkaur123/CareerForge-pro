import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ children }) {
  const { token, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid var(--surface-2)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading…</p>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return children;
}
