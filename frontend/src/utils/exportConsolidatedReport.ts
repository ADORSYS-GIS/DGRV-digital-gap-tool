import type { ConsolidatedReport } from "@/openapi-client/types.gen";

function riskLabel(level: number): string {
  if (level < 1.5) return "Low";
  if (level <= 2.5) return "Medium";
  return "High";
}

function riskColor(level: number): string {
  if (level < 1.5) return "#16a34a";
  if (level <= 2.5) return "#d97706";
  return "#dc2626";
}

/**
 * Generates a clean HTML string from the consolidated report data
 * and opens a print window. Percentages are plain text — no badges.
 */
export function exportConsolidatedReportAsPDF(
  report: ConsolidatedReport,
  organizationName?: string,
): void {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Dimension Analysis table rows ──────────────────────────────────────
  const tableRows = report.dimension_summaries
    .map((s) => {
      const { high_risk_percentage, medium_risk_percentage, low_risk_percentage } =
        s.risk_level_distribution;
      return `
        <tr>
          <td>${s.dimension_name}</td>
          <td style="color:#dc2626;font-weight:600;">${high_risk_percentage.toFixed(2)}%</td>
          <td style="color:#d97706;font-weight:600;">${medium_risk_percentage.toFixed(2)}%</td>
          <td style="color:#16a34a;font-weight:600;">${low_risk_percentage.toFixed(2)}%</td>
        </tr>`;
    })
    .join("");

  // ── Highest risk dimension section ─────────────────────────────────────
  const highest =
    report.dimension_summaries.length > 0
      ? report.dimension_summaries.reduce((a, b) =>
          a.average_risk_level > b.average_risk_level ? a : b,
        )
      : null;

  const highestSection = highest
    ? `
    <div class="section">
      <h2>Dimension Needing Attention &amp; Recommendations</h2>
      <p class="subtitle">
        ${
          highest.average_risk_level > 2.5
            ? "Priority focus area requiring immediate attention"
            : highest.average_risk_level >= 1.5
              ? "This dimension has a moderate gap — worth monitoring and improving"
              : "All dimensions are performing well. This one has the most potential for further growth"
        }
      </p>
      <h3>${highest.dimension_name}</h3>
      <p>Average Risk Score: <strong style="color:${riskColor(highest.average_risk_level)}">${riskLabel(highest.average_risk_level)}</strong></p>
      ${
        highest.top_recommendations.length > 0
          ? `<p style="margin-top:10px;font-weight:600;">Recommendations:</p>
             <ul>${highest.top_recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>`
          : ""
      }
    </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Consolidated Report${organizationName ? ` — ${organizationName}` : ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: white; padding: 24px; }
    h1 { font-size: 22px; color: #1e40af; margin-bottom: 4px; }
    h2 { font-size: 16px; color: #1e293b; margin-bottom: 4px; }
    h3 { font-size: 14px; color: #1e293b; margin: 10px 0 4px; }
    p { color: #475569; font-size: 12px; margin-bottom: 6px; }
    .subtitle { font-size: 11px; color: #64748b; margin-bottom: 10px; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
    .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
    .section { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .stat { display: inline-block; background: #f1f5f9; border-radius: 6px; padding: 10px 16px; margin-right: 12px; margin-bottom: 12px; }
    .stat-label { font-size: 11px; color: #64748b; }
    .stat-value { font-size: 20px; font-weight: 700; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1e40af; color: white; padding: 9px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f8fafc; }
    ul { padding-left: 18px; margin-top: 6px; }
    li { margin-bottom: 4px; font-size: 12px; color: #374151; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @page { margin: 15mm; size: A4; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Consolidated Report</h1>
    ${organizationName ? `<p class="meta">Organisation: <strong>${organizationName}</strong></p>` : ""}
    <p class="meta">Generated: ${date}</p>
  </div>

  <div style="margin-bottom:16px;">
    <div class="stat">
      <div class="stat-label">Total Submissions</div>
      <div class="stat-value">${report.total_submissions}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Overall Avg Gap Score</div>
      <div class="stat-value" style="color:${riskColor(report.overall_average_risk_level)}">${report.overall_average_gap_score.toFixed(2)}</div>
    </div>
  </div>

  <div class="section">
    <h2>Dimension Analysis</h2>
    <p class="subtitle">Detailed breakdown of risk levels and gap scores by dimension</p>
    <table>
      <thead>
        <tr>
          <th>Dimension</th>
          <th>High Risk %</th>
          <th>Medium Risk %</th>
          <th>Low Risk %</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  ${highestSection}

  <div class="footer">Generated on ${date}</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 400);
}
