import jsPDF from "jspdf";
import type { ConsolidatedReport } from "@/openapi-client/types.gen";

function riskLabel(level: number): string {
  if (level < 1.5) return "Low";
  if (level <= 2.5) return "Medium";
  return "High";
}

// RGB tuples for jsPDF setTextColor
const COLORS = {
  high:   [220, 38,  38]  as [number, number, number],
  medium: [217, 119, 6]   as [number, number, number],
  low:    [22,  163, 74]  as [number, number, number],
  black:  [17,  24,  39]  as [number, number, number],
  gray:   [100, 116, 139] as [number, number, number],
  blue:   [30,  64,  175] as [number, number, number],
  white:  [255, 255, 255] as [number, number, number],
};

function riskColor(level: number): [number, number, number] {
  if (level < 1.5) return COLORS.low;
  if (level <= 2.5) return COLORS.medium;
  return COLORS.high;
}

/**
 * Generates a PDF from the consolidated report data using jsPDF.
 * No DOM, no print dialog, no badge rendering issues.
 */
export function exportConsolidatedReportAsPDF(
  report: ConsolidatedReport,
  organizationName?: string,
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.blue);
  doc.rect(margin, y, contentW, 0.8, "F");
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.blue);
  doc.text("Consolidated Report", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  if (organizationName) {
    doc.text(`Organisation: ${organizationName}`, margin, y);
    y += 5;
  }
  doc.text(`Generated: ${date}`, margin, y);
  y += 8;

  // ── Summary stats ────────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, 55, 16, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("Total Submissions", margin + 4, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.black);
  doc.text(String(report.total_submissions), margin + 4, y + 13);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + 60, y, 65, 16, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("Overall Avg Gap Score", margin + 64, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...riskColor(report.overall_average_risk_level));
  doc.text(report.overall_average_gap_score.toFixed(2), margin + 64, y + 13);
  y += 22;

  // ── Dimension Analysis table ─────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.black);
  doc.text("Dimension Analysis", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("Detailed breakdown of risk levels and gap scores by dimension", margin, y);
  y += 6;

  // Table header
  const colW = [contentW * 0.4, contentW * 0.2, contentW * 0.2, contentW * 0.2];
  const colX = [margin, margin + colW[0], margin + colW[0] + colW[1], margin + colW[0] + colW[1] + colW[2]];
  const rowH = 8;

  doc.setFillColor(...COLORS.blue);
  doc.rect(margin, y, contentW, rowH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  ["DIMENSION", "HIGH RISK %", "MEDIUM RISK %", "LOW RISK %"].forEach((h, i) => {
    doc.text(h, colX[i] + 2, y + 5.5);
  });
  y += rowH;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  report.dimension_summaries.forEach((s, idx) => {
    if (y > 260) { doc.addPage(); y = margin; }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentW, rowH, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentW, rowH, "S");

    doc.setTextColor(...COLORS.black);
    doc.text(s.dimension_name, colX[0] + 2, y + 5.5);

    const { high_risk_percentage, medium_risk_percentage, low_risk_percentage } =
      s.risk_level_distribution;

    doc.setTextColor(...COLORS.high);
    doc.setFont("helvetica", "bold");
    doc.text(`${high_risk_percentage.toFixed(2)}%`, colX[1] + 2, y + 5.5);

    doc.setTextColor(...COLORS.medium);
    doc.text(`${medium_risk_percentage.toFixed(2)}%`, colX[2] + 2, y + 5.5);

    doc.setTextColor(...COLORS.low);
    doc.text(`${low_risk_percentage.toFixed(2)}%`, colX[3] + 2, y + 5.5);

    doc.setFont("helvetica", "normal");
    y += rowH;
  });
  y += 8;

  // ── Highest risk dimension ───────────────────────────────────────────────
  if (report.dimension_summaries.length > 0) {
    const highest = report.dimension_summaries.reduce((a, b) =>
      a.average_risk_level > b.average_risk_level ? a : b,
    );

    if (y > 220) { doc.addPage(); y = margin; }

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    const sectionH = 14 + highest.top_recommendations.length * 8 + 10;
    doc.roundedRect(margin, y, contentW, sectionH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.black);
    doc.text("Dimension Needing Attention & Recommendations", margin + 4, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);
    const subtitle =
      highest.average_risk_level > 2.5
        ? "Priority focus area requiring immediate attention"
        : highest.average_risk_level >= 1.5
          ? "This dimension has a moderate gap — worth monitoring and improving"
          : "All dimensions are performing well";
    doc.text(subtitle, margin + 4, y + 12);
    y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.black);
    doc.text(highest.dimension_name, margin + 4, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.gray);
    doc.text("Average Risk Score: ", margin + 4, y);
    const labelW = doc.getTextWidth("Average Risk Score: ");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...riskColor(highest.average_risk_level));
    doc.text(riskLabel(highest.average_risk_level), margin + 4 + labelW, y);
    y += 6;

    if (highest.top_recommendations.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.black);
      doc.text("Recommendations:", margin + 4, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.black);
      highest.top_recommendations.forEach((rec) => {
        if (y > 270) { doc.addPage(); y = margin; }
        const lines = doc.splitTextToSize(`• ${rec}`, contentW - 8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5;
      });
    }
    y += 4;
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 285, pageW - margin, 285);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(`Generated on ${date}`, pageW / 2, 290, { align: "center" });

  doc.save(`consolidated-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
