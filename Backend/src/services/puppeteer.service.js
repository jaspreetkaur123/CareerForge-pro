<<<<<<< HEAD
/**
 * Puppeteer PDF generation service.
 * Fully implemented in Phase 3.
 */
/**
 * Generate a PDF from structured resume data.
 * @param {object} resumeData - Structured resume JSON (rewrittenData)
 * @param {string} template - "classic" | "modern" | "minimal"
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generatePDF = async (resumeData, template = "classic") => {
  // TODO: Implement in Phase 3
  throw new Error("PDF generation not yet implemented (Phase 3)");
};
=======
import puppeteer from "puppeteer";

// ─────────────────────────────────────────────────────────────────────────────
// Helper – safely join an array or return a fallback string
// ─────────────────────────────────────────────────────────────────────────────
const list = (arr) => (Array.isArray(arr) ? arr : []);

// ─────────────────────────────────────────────────────────────────────────────
// Template: CLASSIC
// Single column · Times-New-Roman feel · ATS safe
// ─────────────────────────────────────────────────────────────────────────────
function classicTemplate(d) {
  const expHTML = list(d.experience)
    .map(
      (e) => `
    <div class="exp-block">
      <div class="exp-header">
        <span class="exp-title">${e.title || ""} — ${e.company || ""}</span>
        <span class="exp-dates">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}</span>
      </div>
      <ul>
        ${list(e.bullets)
          .map((b) => `<li>${b}</li>`)
          .join("")}
      </ul>
    </div>`
    )
    .join("");

  const eduHTML = list(d.education)
    .map(
      (e) => `
    <div class="edu-block">
      <div class="exp-header">
        <span class="exp-title">${e.degree || ""}${e.field ? ` in ${e.field}` : ""} — ${e.institution || ""}</span>
        <span class="exp-dates">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}${e.gpa ? ` · GPA ${e.gpa}` : ""}</span>
      </div>
    </div>`
    )
    .join("");

  const certsHTML =
    list(d.certifications).length
      ? `<section>
          <h2>Certifications</h2>
          <ul>${list(d.certifications)
            .map((c) => `<li>${c}</li>`)
            .join("")}</ul>
         </section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 36pt 48pt;
    line-height: 1.55;
  }
  .name {
    font-size: 22pt;
    font-weight: bold;
    letter-spacing: 0.04em;
    text-align: center;
    margin-bottom: 4pt;
  }
  .contact {
    text-align: center;
    font-size: 9.5pt;
    color: #444;
    margin-bottom: 16pt;
  }
  .contact a { color: #444; text-decoration: none; }
  .divider { border: none; border-top: 1.5px solid #1a1a1a; margin: 10pt 0; }
  h2 {
    font-size: 11.5pt;
    font-variant: small-caps;
    letter-spacing: 0.12em;
    border-bottom: 0.8px solid #888;
    padding-bottom: 2pt;
    margin-bottom: 8pt;
    margin-top: 14pt;
    color: #000;
  }
  .summary { margin-bottom: 4pt; font-size: 10.5pt; }
  .exp-block { margin-bottom: 10pt; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: bold; font-size: 10.5pt; }
  .exp-dates { font-size: 9.5pt; color: #555; white-space: nowrap; margin-left: 8pt; }
  ul { margin-left: 18pt; margin-top: 4pt; }
  li { margin-bottom: 2.5pt; font-size: 10pt; }
  .skills-list { font-size: 10pt; }
  .edu-block { margin-bottom: 8pt; }
  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <div class="name">${d.name || "Your Name"}</div>
  <div class="contact">
    ${[d.email, d.phone, d.location, d.linkedin, d.github]
      .filter(Boolean)
      .join(" &nbsp;|&nbsp; ")}
  </div>
  <hr class="divider" />

  ${d.summary ? `<section><h2>Professional Summary</h2><p class="summary">${d.summary}</p></section>` : ""}

  ${list(d.experience).length ? `<section><h2>Experience</h2>${expHTML}</section>` : ""}

  ${list(d.skills).length ? `<section><h2>Skills</h2><p class="skills-list">${list(d.skills).join(" · ")}</p></section>` : ""}

  ${list(d.education).length ? `<section><h2>Education</h2>${eduHTML}</section>` : ""}

  ${certsHTML}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template: MODERN
// Two-column · accent sidebar · electric violet + white
// ─────────────────────────────────────────────────────────────────────────────
function modernTemplate(d) {
  const expHTML = list(d.experience)
    .map(
      (e) => `
    <div class="exp-block">
      <div class="job-title">${e.title || ""}</div>
      <div class="company">${e.company || ""} &nbsp;|&nbsp; <span class="dates">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}</span></div>
      <ul>
        ${list(e.bullets)
          .map((b) => `<li>${b}</li>`)
          .join("")}
      </ul>
    </div>`
    )
    .join("");

  const eduHTML = list(d.education)
    .map(
      (e) => `
    <div class="edu-block">
      <div class="edu-degree">${e.degree || ""}${e.field ? ` in ${e.field}` : ""}</div>
      <div class="edu-inst">${e.institution || ""} · ${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}${e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10pt;
    color: #222;
    background: #fff;
    display: flex;
    min-height: 100vh;
  }
  /* ── Left sidebar ── */
  .sidebar {
    width: 200pt;
    min-width: 200pt;
    background: #6C63FF;
    color: #fff;
    padding: 32pt 18pt;
    display: flex;
    flex-direction: column;
    gap: 20pt;
  }
  .sidebar-name {
    font-size: 16pt;
    font-weight: 700;
    line-height: 1.25;
    word-break: break-word;
  }
  .sidebar-role {
    font-size: 9pt;
    opacity: 0.85;
    margin-top: 4pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .sidebar h3 {
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    border-bottom: 1px solid rgba(255,255,255,0.35);
    padding-bottom: 4pt;
    margin-bottom: 6pt;
    font-weight: 600;
  }
  .contact-item { font-size: 8.5pt; margin-bottom: 5pt; opacity: 0.9; word-break: break-all; }
  .skill-badge {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    border-radius: 3pt;
    padding: 2pt 6pt;
    font-size: 8pt;
    margin: 2pt 2pt 0 0;
  }
  .cert-item { font-size: 8.5pt; margin-bottom: 4pt; opacity: 0.88; }

  /* ── Main content ── */
  .main {
    flex: 1;
    padding: 32pt 28pt;
    display: flex;
    flex-direction: column;
    gap: 16pt;
  }
  .section-title {
    font-size: 10.5pt;
    font-weight: 700;
    color: #6C63FF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-bottom: 2px solid #6C63FF;
    padding-bottom: 3pt;
    margin-bottom: 10pt;
  }
  .exp-block { margin-bottom: 12pt; }
  .job-title { font-weight: 700; font-size: 10.5pt; }
  .company { font-size: 9pt; color: #555; margin-bottom: 4pt; }
  .dates { color: #888; }
  ul { margin-left: 14pt; }
  li { margin-bottom: 2.5pt; font-size: 9.5pt; }
  .edu-block { margin-bottom: 8pt; }
  .edu-degree { font-weight: 600; font-size: 10pt; }
  .edu-inst { font-size: 9pt; color: #666; }
  .summary-text { font-size: 9.5pt; line-height: 1.6; color: #333; }
  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <!-- Sidebar -->
  <div class="sidebar">
    <div>
      <div class="sidebar-name">${d.name || "Your Name"}</div>
      ${d.experience?.[0]?.title ? `<div class="sidebar-role">${d.experience[0].title}</div>` : ""}
    </div>

    <div>
      <h3>Contact</h3>
      ${d.email ? `<div class="contact-item">✉ ${d.email}</div>` : ""}
      ${d.phone ? `<div class="contact-item">☏ ${d.phone}</div>` : ""}
      ${d.location ? `<div class="contact-item">⌖ ${d.location}</div>` : ""}
      ${d.linkedin ? `<div class="contact-item">in ${d.linkedin}</div>` : ""}
      ${d.github ? `<div class="contact-item">⌂ ${d.github}</div>` : ""}
    </div>

    ${list(d.skills).length ? `
    <div>
      <h3>Skills</h3>
      <div>${list(d.skills).map((s) => `<span class="skill-badge">${s}</span>`).join("")}</div>
    </div>` : ""}

    ${list(d.certifications).length ? `
    <div>
      <h3>Certifications</h3>
      ${list(d.certifications).map((c) => `<div class="cert-item">▸ ${c}</div>`).join("")}
    </div>` : ""}
  </div>

  <!-- Main -->
  <div class="main">
    ${d.summary ? `
    <div>
      <div class="section-title">Profile</div>
      <p class="summary-text">${d.summary}</p>
    </div>` : ""}

    ${list(d.experience).length ? `
    <div>
      <div class="section-title">Experience</div>
      ${expHTML}
    </div>` : ""}

    ${list(d.education).length ? `
    <div>
      <div class="section-title">Education</div>
      ${eduHTML}
    </div>` : ""}
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template: MINIMAL
// Clean whitespace · monochrome · generous line-height
// ─────────────────────────────────────────────────────────────────────────────
function minimalTemplate(d) {
  const expHTML = list(d.experience)
    .map(
      (e) => `
    <div class="exp-block">
      <table class="exp-row">
        <tr>
          <td class="exp-left">
            <span class="job-title">${e.title || ""}</span><br/>
            <span class="company">${e.company || ""}</span>
          </td>
          <td class="exp-right">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}</td>
        </tr>
      </table>
      <ul>${list(e.bullets)
        .map((b) => `<li>${b}</li>`)
        .join("")}</ul>
    </div>`
    )
    .join("");

  const eduHTML = list(d.education)
    .map(
      (e) => `
    <div class="edu-block">
      <table class="exp-row">
        <tr>
          <td class="exp-left">
            <span class="job-title">${e.degree || ""}${e.field ? `, ${e.field}` : ""}</span><br/>
            <span class="company">${e.institution || ""}</span>
          </td>
          <td class="exp-right">${e.startDate || ""}${e.endDate ? ` – ${e.endDate}` : ""}${e.gpa ? `<br/>GPA: ${e.gpa}` : ""}</td>
        </tr>
      </table>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
    font-size: 10.5pt;
    color: #111;
    background: #fff;
    padding: 40pt 52pt;
    line-height: 1.65;
  }
  /* Header */
  .header { margin-bottom: 24pt; }
  .name { font-size: 24pt; font-weight: 300; letter-spacing: -0.02em; color: #000; }
  .contact-line { font-size: 8.5pt; color: #666; margin-top: 6pt; letter-spacing: 0.02em; }
  .contact-line span + span::before { content: "  ·  "; }

  /* Section */
  .section { margin-bottom: 20pt; }
  .section-label {
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #999;
    margin-bottom: 8pt;
  }

  /* Rule */
  .rule { border: none; border-top: 0.5px solid #ddd; margin-bottom: 16pt; }

  /* Experience */
  .exp-block { margin-bottom: 14pt; }
  .exp-row { width: 100%; border-collapse: collapse; }
  .exp-left { vertical-align: top; }
  .exp-right { vertical-align: top; text-align: right; font-size: 9pt; color: #888; white-space: nowrap; padding-left: 12pt; }
  .job-title { font-weight: 600; font-size: 10.5pt; }
  .company { font-size: 9.5pt; color: #555; }
  ul { margin-left: 14pt; margin-top: 5pt; }
  li { font-size: 9.5pt; margin-bottom: 2pt; color: #333; }

  /* Education */
  .edu-block { margin-bottom: 10pt; }

  /* Skills */
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 4pt 12pt; }
  .skill { font-size: 9.5pt; color: #333; }
  .skill::before { content: "—  "; color: #bbb; }

  /* Certs */
  .cert-list { font-size: 9.5pt; color: #333; }
  .cert-list li { list-style: none; padding-left: 0; }
  .cert-list li::before { content: "✓  "; color: #6C63FF; }

  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="name">${d.name || "Your Name"}</div>
    <div class="contact-line">
      ${[d.email, d.phone, d.location, d.linkedin, d.github]
        .filter(Boolean)
        .map((x) => `<span>${x}</span>`)
        .join("")}
    </div>
  </div>

  ${d.summary ? `
  <div class="section">
    <div class="section-label">Summary</div>
    <hr class="rule" />
    <p style="font-size:9.5pt;color:#333;line-height:1.7">${d.summary}</p>
  </div>` : ""}

  ${list(d.experience).length ? `
  <div class="section">
    <div class="section-label">Experience</div>
    <hr class="rule" />
    ${expHTML}
  </div>` : ""}

  ${list(d.skills).length ? `
  <div class="section">
    <div class="section-label">Skills</div>
    <hr class="rule" />
    <div class="skills-wrap">
      ${list(d.skills).map((s) => `<span class="skill">${s}</span>`).join("")}
    </div>
  </div>` : ""}

  ${list(d.education).length ? `
  <div class="section">
    <div class="section-label">Education</div>
    <hr class="rule" />
    ${eduHTML}
  </div>` : ""}

  ${list(d.certifications).length ? `
  <div class="section">
    <div class="section-label">Certifications</div>
    <hr class="rule" />
    <ul class="cert-list">
      ${list(d.certifications).map((c) => `<li>${c}</li>`).join("")}
    </ul>
  </div>` : ""}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Template dispatcher
// ─────────────────────────────────────────────────────────────────────────────
function buildHTML(resumeData, template) {
  switch (template) {
    case "modern":
      return modernTemplate(resumeData);
    case "minimal":
      return minimalTemplate(resumeData);
    case "classic":
    default:
      return classicTemplate(resumeData);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: generatePDF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a PDF from structured resume data using Puppeteer.
 *
 * @param {object} resumeData  — Structured resume JSON (the rewrittenData object)
 * @param {string} template    — "classic" | "modern" | "minimal"
 * @returns {Promise<Buffer>}  — Raw PDF buffer ready to stream
 */
export const generatePDF = async (resumeData, template = "classic") => {
  const html = buildHTML(resumeData, template);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // Load HTML directly — no external requests, fully self-contained
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

>>>>>>> 4b9da61 (main)
export default { generatePDF };
