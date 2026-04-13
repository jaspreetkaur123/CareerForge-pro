import { useEffect, useRef } from "react";

export default function ATSScoreRing({ score = 0, size = 140 }) {
  const circleRef = useRef(null);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (score / 100) * circumference;
    circleRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
    circleRef.current.style.strokeDashoffset = offset;
  }, [score, circumference]);

  const color =
    score >= 80 ? "var(--accent)" :
    score >= 60 ? "#fbbf24" :
    "#ef4444";

  const label =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Fair" :
    "Needs Work";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--surface-2)" strokeWidth={10}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color, fontFamily: "Sora, sans-serif", lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", fontWeight: 500 }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>ATS Score</p>
      </div>
    </div>
  );
}
