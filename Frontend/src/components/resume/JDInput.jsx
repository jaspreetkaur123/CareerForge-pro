import { useState } from "react";

export default function JDInput({ onAnalyze, loading }) {
  const [jdText, setJdText] = useState("");

  const handleSubmit = () => {
    if (!jdText.trim()) return;
    onAnalyze(jdText.trim());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
          Job Description
        </label>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {jdText.length} chars
        </span>
      </div>
      <textarea
        id="jd-input"
        className="input textarea"
        placeholder={`Paste the full job description here…\n\nExample:\n  "We're looking for a Senior React Engineer…\n   Requirements: 5+ years TypeScript, CI/CD experience…"`}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        rows={10}
        style={{ minHeight: 220, fontSize: "0.85rem", lineHeight: 1.65 }}
      />
      <button
        id="analyze-jd-btn"
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading || jdText.trim().length < 50}
        style={{ alignSelf: "flex-start" }}
      >
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              animation: "spin 0.75s linear infinite",
              display: "inline-block",
            }} />
            Analyzing…
          </>
        ) : "🔍 Analyze Job Description"}
      </button>
      {jdText.trim().length > 0 && jdText.trim().length < 50 && (
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Paste at least 50 characters for accurate analysis.
        </p>
      )}
    </div>
  );
}
