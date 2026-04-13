import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ResumeUploader({ onText, loading }) {
  const [mode, setMode] = useState("upload"); // "upload" | "paste"
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (acceptedFiles) => {
      setError("");
      const file = acceptedFiles[0];
      if (!file) return;
      setFileName(file.name);
      onText({ file });
    },
    [onText]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => setError("Please upload a valid PDF under 10 MB."),
  });

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return setError("Please paste your resume text.");
    setError("");
    onText({ rawText: pastedText.trim() });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mode toggle */}
      <div style={{
        display: "flex", background: "var(--surface-2)", borderRadius: 10,
        padding: 4, gap: 4, width: "fit-content",
      }}>
        {["upload", "paste"].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            style={{
              padding: "6px 18px", borderRadius: 8, border: "none",
              background: mode === m ? "var(--primary)" : "transparent",
              color: mode === m ? "#fff" : "var(--text-secondary)",
              fontWeight: mode === m ? 600 : 400,
              fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {m === "upload" ? "📄 Upload PDF" : "✏️ Paste Text"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragActive ? "rgba(108,99,255,0.06)" : "var(--surface-2)",
            transition: "all 0.22s",
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>{isDragActive ? "📂" : fileName ? "✅" : "📄"}</div>
          {fileName ? (
            <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>{fileName}</p>
          ) : (
            <>
              <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                {isDragActive ? "Drop it here!" : "Drag & drop your resume PDF"}
              </p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>or click to browse · max 10 MB</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea
            className="input textarea"
            placeholder="Paste your resume text here…"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={10}
            style={{ minHeight: 220 }}
          />
          <button
            className="btn-primary"
            onClick={handlePasteSubmit}
            disabled={loading || !pastedText.trim()}
            style={{ alignSelf: "flex-start" }}
          >
            {loading ? "Processing…" : "Use This Text →"}
          </button>
        </div>
      )}

      {error && <p style={{ color: "#ef4444", fontSize: "0.82rem" }}>{error}</p>}
    </div>
  );
}
