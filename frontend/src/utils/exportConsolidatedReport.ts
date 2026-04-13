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

export function exportConsolidatedReportAsPDF(
  report: ConsolidatedReport,
  organizationName?: string,
): void {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableRows = report.dimension_summaries
    .map((s) => {
      const { high_risk_percentage, medium_risk_percentage, low_risk_percentage } =
        s.risk_level_distribution;
      return `<tr>
        <td>${s.dimension_name}</td>
        <td style="color:#dc2626;font-weight:700;">${high_risk_percentage.toFixed(2)}%</td>
        <td style="color:#d97706;font-weight:700;">${medium_risk_percentage.toFixed(2)}%</td>
        <td style="color:#16a34a;font-weight:700;">${low_risk_percentage.toFixed(2)}%</td>
      </tr>`;
    })
    .join("");

  const highest =
    report.dimension_summaries.length > 0
      ? report.dimension_summaries.reduce((a, b) =>
          a.average_risk_level > b.average_risk_level ? a : b,
        )
      : null;

  const highestSection = highest
    ? `<div class="section">
        <h2>Dimension Needing Attention &amp; Recommendations</h2>
        <p class="sub">${
          highest.average_risk_level > 2.5
            ? "Priority focus area requiring immediate attention"
            : highest.average_risk_level >= 1.5
              ? "This dimension has a moderate gap — worth monitoring and improving"
              : "All dimensions are performing well"
        }</p>
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
<html>
<head>
<meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,sans-serif;font-size:13px;color:#111;background:white;padding:24px;}
h1{font-size:22px;color:#1e40af;margin-bottom:4px;}
h2{font-size:15px;color:#1e293b;margin-bottom:4px;}
h3{font-size:13px;font-weight:700;margin:8px 0 4px;}
p{color:#475569;font-size:12px;margin-bottom:5px;}
.sub{font-size:11px;color:#64748b;margin-bottom:8px;}
.header{border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:18px;}
.meta{font-size:11px;color:#64748b;margin-top:3px;}
.section{border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin-bottom:14px;}
.stats{margin-bottom:14px;}
.stat{display:inline-block;background:#f1f5f9;border-radius:6px;padding:8px 14px;margin-right:10px;}
.stat-label{font-size:10px;color:#64748b;}
.stat-value{font-size:18px;font-weight:700;color:#1e293b;}
table{width:100%;border-collapse:collapse;margin-top:8px;}
th{background:#1e40af;color:white;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;}
td{padding:7px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;}
tr:nth-child(even) td{background:#f8fafc;}
ul{padding-left:16px;margin-top:5px;}
li{margin-bottom:3px;font-size:12px;color:#374151;}
.footer{margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;}
@page{margin:15mm;size:A4;}
</style>
</head>
<body>
<div class="header">
  <h1>Consolidated Report</h1>
  ${organizationName ? `<p class="meta">Organisation: <strong>${organizationName}</strong></p>` : ""}
  <p class="meta">Generated: ${date}</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-label">Total Submissions</div><div class="stat-value">${report.total_submissions}</div></div>
  <div class="stat"><div class="stat-label">Overall Avg Gap Score</div><div class="stat-value" style="color:${riskColor(report.overall_average_risk_level)}">${report.overall_average_gap_score.toFixed(2)}</div></div>
</div>
<div class="section">
  <h2>Dimension Analysis</h2>
  <p class="sub">Detailed breakdown of risk levels and gap scores by dimension</p>
  <table>
    <thead><tr><th>Dimension</th><th>High Risk %</th><th>Medium Risk %</th><th>Low Risk %</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>
${highestSection}
<div class="footer">Generated on ${date}</div>
</body>
</html>`;

  // Use a hidden iframe instead of window.open to avoid popup blockers
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 500);
}
