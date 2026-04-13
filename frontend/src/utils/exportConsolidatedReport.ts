import jsPDF from "jspdf";
import type { ConsolidatedReport } from "@/openapi-client/types.gen";

type RGB = [number, number, number];

const C = {
  blue:      [30,  64,  175] as RGB,
  blueMid:   [59,  130, 246] as RGB,
  blueLight: [219, 234, 254] as RGB,
  high:      [220, 38,  38]  as RGB,
  highBg:    [254, 226, 226] as RGB,
  medium:    [217, 119, 6]   as RGB,
  mediumBg:  [254, 243, 199] as RGB,
  low:       [22,  163, 74]  as RGB,
  lowBg:     [220, 252, 231] as RGB,
  black:     [15,  23,  42]  as RGB,
  gray:      [100, 116, 139] as RGB,
  grayLight: [226, 232, 240] as RGB,
  bgRow:     [248, 250, 252] as RGB,
  white:     [255, 255, 255] as RGB,
};

function riskLabel(level: number) {
  return level < 1.5 ? "Low" : level <= 2.5 ? "Medium" : "High";
}
function riskColor(level: number): RGB {
  return level < 1.5 ? C.low : level <= 2.5 ? C.medium : C.high;
}

function setColor(doc: jsPDF, color: RGB) {
  doc.setTextColor(color[0], color[1], color[2]);
}
function setFill(doc: jsPDF, color: RGB) {
  doc.setFillColor(color[0], color[1], color[2]);
}
function setDraw(doc: jsPDF, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

export function exportConsolidatedReportAsPDF(
  report: ConsolidatedReport,
  organizationName?: string,
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const CW = W - M * 2;
  let y = 0;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  function newPage() {
    doc.addPage();
    y = M;
    // subtle top border on new pages
    setFill(doc, C.blue);
    doc.rect(0, 0, W, 1.5, "F");
  }

  function checkPage(needed: number) {
    if (y + needed > H - 16) newPage();
  }

  // ── Cover header band ────────────────────────────────────────────────────
  setFill(doc, C.blue);
  doc.rect(0, 0, W, 38, "F");

  // Logo area placeholder
  setFill(doc, C.blueMid);
  doc.roundedRect(M, 8, 22, 22, 2, 2, "F");
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DGRV", M + 11, 21, { align: "center" });

  // Title
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Consolidated Report", M + 28, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(doc, C.blueLight);
  doc.text(
    organizationName
      ? `${organizationName}  ·  ${date}`
      : `Digital Gap Analysis  ·  ${date}`,
    M + 28,
    25,
  );

  y = 46;

  // ── Summary cards ────────────────────────────────────────────────────────
  const cardW = (CW - 6) / 3;
  const cards = [
    { label: "Total Submissions", value: String(report.total_submissions), color: C.blue },
    { label: "Avg Gap Score", value: report.overall_average_gap_score.toFixed(2), color: riskColor(report.overall_average_risk_level) },
    { label: "Risk Level", value: riskLabel(report.overall_average_risk_level), color: riskColor(report.overall_average_risk_level) },
  ];
  cards.forEach((card, i) => {
    const cx = M + i * (cardW + 3);
    setFill(doc, C.bgRow);
    setDraw(doc, C.grayLight);
    doc.roundedRect(cx, y, cardW, 18, 2, 2, "FD");
    setColor(doc, C.gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(card.label, cx + 4, y + 6);
    setColor(doc, card.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(card.value, cx + 4, y + 14);
  });
  y += 24;

  // ── Dimension Analysis table ─────────────────────────────────────────────
  checkPage(60);
  setColor(doc, C.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Dimension Analysis", M, y);
  y += 4;
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Risk level distribution across all submissions", M, y);
  y += 5;

  const cols = [CW * 0.38, CW * 0.205, CW * 0.205, CW * 0.21];
  const xs = [M, M + cols[0], M + cols[0] + cols[1], M + cols[0] + cols[1] + cols[2]];
  const rh = 7.5;

  // Header
  setFill(doc, C.blue);
  doc.rect(M, y, CW, rh, "F");
  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  ["DIMENSION", "HIGH RISK %", "MEDIUM RISK %", "LOW RISK %"].forEach((h, i) => {
    doc.text(h, xs[i] + 2.5, y + 5);
  });
  y += rh;

  report.dimension_summaries.forEach((s, idx) => {
    checkPage(rh + 2);
    if (idx % 2 === 0) {
      setFill(doc, C.bgRow);
      doc.rect(M, y, CW, rh, "F");
    }
    setDraw(doc, C.grayLight);
    doc.setLineWidth(0.2);
    doc.line(M, y + rh, M + CW, y + rh);

    setColor(doc, C.black);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(s.dimension_name, xs[0] + 2.5, y + 5);

    const { high_risk_percentage: h, medium_risk_percentage: m, low_risk_percentage: l } =
      s.risk_level_distribution;

    setColor(doc, C.high);
    doc.setFont("helvetica", "bold");
    doc.text(`${h.toFixed(2)}%`, xs[1] + 2.5, y + 5);
    setColor(doc, C.medium);
    doc.text(`${m.toFixed(2)}%`, xs[2] + 2.5, y + 5);
    setColor(doc, C.low);
    doc.text(`${l.toFixed(2)}%`, xs[3] + 2.5, y + 5);
    doc.setFont("helvetica", "normal");
    y += rh;
  });
  y += 10;

  // ── Bar chart: Dominant risk per dimension ───────────────────────────────
  checkPage(70);
  setColor(doc, C.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Dominant Risk Level by Dimension", M, y);
  y += 4;
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Percentage of dominant risk level per dimension", M, y);
  y += 6;

  const chartH = 45;
  const barAreaW = CW;
  const n = report.dimension_summaries.length;
  const barW = Math.min(18, (barAreaW - 4) / n - 3);
  const gap = (barAreaW - n * barW) / (n + 1);
  const chartTop = y;
  const chartBottom = y + chartH;

  // Y-axis lines
  setDraw(doc, C.grayLight);
  doc.setLineWidth(0.2);
  [0, 25, 50, 75, 100].forEach((pct) => {
    const lineY = chartBottom - (pct / 100) * chartH;
    doc.line(M, lineY, M + barAreaW, lineY);
    setColor(doc, C.gray);
    doc.setFontSize(6.5);
    doc.text(`${pct}%`, M - 1, lineY + 1, { align: "right" });
  });

  report.dimension_summaries.forEach((s, i) => {
    const { high_risk_percentage: h, medium_risk_percentage: m, low_risk_percentage: l } =
      s.risk_level_distribution;

    // Pick dominant
    let pct = l; let color = C.low;
    if (m > pct) { pct = m; color = C.medium; }
    if (h > pct) { pct = h; color = C.high; }

    const bx = M + gap + i * (barW + gap);
    const bh = (pct / 100) * chartH;
    const by = chartBottom - bh;

    setFill(doc, color);
    doc.roundedRect(bx, by, barW, bh, 1, 1, "F");

    // Dimension label (rotated via short name)
    setColor(doc, C.gray);
    doc.setFontSize(6);
    const label = s.dimension_name.length > 10
      ? s.dimension_name.slice(0, 9) + "…"
      : s.dimension_name;
    doc.text(label, bx + barW / 2, chartBottom + 4, { align: "center" });
  });

  // Legend
  y = chartBottom + 10;
  const legendItems = [
    { label: "High Risk", color: C.high },
    { label: "Medium Risk", color: C.medium },
    { label: "Low Risk", color: C.low },
  ];
  let lx = M;
  legendItems.forEach(({ label, color }) => {
    setFill(doc, color);
    doc.rect(lx, y - 3, 4, 4, "F");
    setColor(doc, C.gray);
    doc.setFontSize(8);
    doc.text(label, lx + 6, y);
    lx += 32;
  });
  y += 10;

  // ── Highest risk dimension ───────────────────────────────────────────────
  if (report.dimension_summaries.length > 0) {
    const highest = report.dimension_summaries.reduce((a, b) =>
      a.average_risk_level > b.average_risk_level ? a : b,
    );
    const isHigh = highest.average_risk_level > 2.5;
    const isMed = highest.average_risk_level >= 1.5;
    const accentColor = isHigh ? C.high : isMed ? C.medium : C.low;
    const bgColor = isHigh ? C.highBg : isMed ? C.mediumBg : C.lowBg;

    const recLines = highest.top_recommendations.flatMap((r) =>
      doc.splitTextToSize(`• ${r}`, CW - 10),
    );
    const sectionH = 32 + recLines.length * 4.5;
    checkPage(sectionH + 4);

    // Accent left border
    setFill(doc, accentColor);
    doc.rect(M, y, 2, sectionH, "F");

    setFill(doc, bgColor);
    doc.rect(M + 2, y, CW - 2, sectionH, "F");

    setColor(doc, C.black);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Dimension Needing Attention & Recommendations", M + 6, y + 7);

    setColor(doc, C.gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const subtitle = isHigh
      ? "Priority focus area requiring immediate attention"
      : isMed
        ? "Moderate gap — worth monitoring and improving"
        : "All dimensions performing well — most room for growth";
    doc.text(subtitle, M + 6, y + 13);

    setColor(doc, C.black);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(highest.dimension_name, M + 6, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Average Risk Score: ", M + 6, y + 26);
    const lw = doc.getTextWidth("Average Risk Score: ");
    setColor(doc, accentColor);
    doc.setFont("helvetica", "bold");
    doc.text(riskLabel(highest.average_risk_level), M + 6 + lw, y + 26);

    y += 30;
    if (recLines.length > 0) {
      setColor(doc, C.black);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Recommendations:", M + 6, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setColor(doc, C.black);
      recLines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, M + 6, y);
        y += 4.5;
      });
    }
    y += 6;
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setFill(doc, C.blue);
    doc.rect(0, H - 8, W, 8, "F");
    setColor(doc, C.blueLight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`Generated on ${date}`, M, H - 3);
    doc.text(`Page ${p} of ${totalPages}`, W - M, H - 3, { align: "right" });
  }

  doc.save(`consolidated-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
