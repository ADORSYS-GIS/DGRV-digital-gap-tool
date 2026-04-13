import jsPDF from "jspdf";
import type { ConsolidatedReport } from "@/openapi-client/types.gen";

type RGB = [number, number, number];

const C = {
  blue:      [30,  64,  175] as RGB,
  blueMid:   [59,  130, 246] as RGB,
  blueLight: [219, 234, 254] as RGB,
  high:      [239, 68,  68]  as RGB,  // #ef4444 — matches on-screen chart
  highBg:    [254, 226, 226] as RGB,
  medium:    [245, 158, 11]  as RGB,  // #f59e0b — matches on-screen chart
  mediumBg:  [254, 243, 199] as RGB,
  low:       [22,  163, 74]  as RGB,  // #16a34a — matches on-screen chart
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
function setColor(doc: jsPDF, color: RGB) { doc.setTextColor(color[0], color[1], color[2]); }
function setFill(doc: jsPDF, color: RGB)  { doc.setFillColor(color[0], color[1], color[2]); }
function setDraw(doc: jsPDF, color: RGB)  { doc.setDrawColor(color[0], color[1], color[2]); }

function sanitize(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Replace any character outside printable ASCII with a space
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function exportConsolidatedReportAsPDF(
  report: ConsolidatedReport,
  organizationName?: string,
): Promise<void> {
  const logoDataUrl = await loadImageAsDataUrl("/dgrv-logo.png");

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
    setFill(doc, C.blue);
    doc.rect(0, 0, W, 1.5, "F");
  }
  function checkPage(needed: number) {
    if (y + needed > H - 16) newPage();
  }

  // ── Header band ──────────────────────────────────────────────────────────
  setFill(doc, C.blue);
  doc.rect(0, 0, W, 38, "F");

  // DGRV logo (real image or fallback text)
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", M, 7, 28, 24);
  } else {
    setFill(doc, C.blueMid);
    doc.roundedRect(M, 8, 22, 22, 2, 2, "F");
    setColor(doc, C.white);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DGRV", M + 11, 21, { align: "center" });
  }

  setColor(doc, C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Consolidated Report", M + 32, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(doc, C.blueLight);
  doc.text(
    organizationName ? `${organizationName}  ·  ${date}` : `Digital Gap Analysis  ·  ${date}`,
    M + 32, 25,
  );

  y = 46;

  // ── Single summary card: Total Submissions ───────────────────────────────
  const cardW = 55;
  setFill(doc, C.bgRow);
  setDraw(doc, C.grayLight);
  doc.roundedRect(M, y, cardW, 18, 2, 2, "FD");
  setColor(doc, C.gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Total Submissions", M + 4, y + 6);
  setColor(doc, C.blue);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(String(report.total_submissions), M + 4, y + 14);
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
  const xs   = [M, M + cols[0], M + cols[0] + cols[1], M + cols[0] + cols[1] + cols[2]];
  const rh   = 7.5;

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
    if (idx % 2 === 0) { setFill(doc, C.bgRow); doc.rect(M, y, CW, rh, "F"); }
    setDraw(doc, C.grayLight);
    doc.setLineWidth(0.2);
    doc.line(M, y + rh, M + CW, y + rh);

    setColor(doc, C.black);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(sanitize(s.dimension_name), xs[0] + 2.5, y + 5);

    const { high_risk_percentage: h, medium_risk_percentage: m, low_risk_percentage: l } =
      s.risk_level_distribution;

    doc.setFont("helvetica", "bold");
    setColor(doc, C.high);   doc.text(`${h.toFixed(2)}%`, xs[1] + 2.5, y + 5);
    setColor(doc, C.medium); doc.text(`${m.toFixed(2)}%`, xs[2] + 2.5, y + 5);
    setColor(doc, C.low);    doc.text(`${l.toFixed(2)}%`, xs[3] + 2.5, y + 5);
    doc.setFont("helvetica", "normal");
    y += rh;
  });
  y += 10;

  // ── Dimension Needing Attention ──────────────────────────────────────────
  if (report.dimension_summaries.length > 0) {
    const highest = report.dimension_summaries.reduce((a, b) =>
      a.average_risk_level > b.average_risk_level ? a : b,
    );
    const isHigh = highest.average_risk_level > 2.5;
    const isMed  = highest.average_risk_level >= 1.5;
    const accentColor = isHigh ? C.high : isMed ? C.medium : C.low;
    const bgColor     = isHigh ? C.highBg : isMed ? C.mediumBg : C.lowBg;

    const recLines = highest.top_recommendations.flatMap((r) =>
      doc.splitTextToSize(`• ${sanitize(r)}`, CW - 10) as string[],
    );
    const sectionH = 34 + recLines.length * 4.5;
    checkPage(sectionH + 4);

    setFill(doc, accentColor);
    doc.rect(M, y, 2.5, sectionH, "F");
    setFill(doc, bgColor);
    doc.rect(M + 2.5, y, CW - 2.5, sectionH, "F");

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
    doc.text(sanitize(highest.dimension_name), M + 6, y + 20);

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
      recLines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, M + 6, y);
        y += 4.5;
      });
    }
    y += 8;
  }

  // ── Bar chart: Dominant risk per dimension (AFTER attention section) ──────
  checkPage(75);
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

  const chartH = 48;
  const n = report.dimension_summaries.length;
  const barW = Math.min(18, (CW - 4) / n - 3);
  const gap  = (CW - n * barW) / (n + 1);
  const chartBottom = y + chartH;

  setDraw(doc, C.grayLight);
  doc.setLineWidth(0.2);
  [0, 25, 50, 75, 100].forEach((pct) => {
    const lineY = chartBottom - (pct / 100) * chartH;
    doc.line(M, lineY, M + CW, lineY);
    setColor(doc, C.gray);
    doc.setFontSize(6.5);
    doc.text(`${pct}%`, M - 1, lineY + 1, { align: "right" });
  });

  report.dimension_summaries.forEach((s, i) => {
    const { high_risk_percentage: h, medium_risk_percentage: m, low_risk_percentage: l } =
      s.risk_level_distribution;

    // Match the on-screen chart logic exactly: >= comparison, medium beats low when equal
    let pct = l; let color = C.low;
    if (m >= pct) { pct = m; color = C.medium; }
    if (h >= pct) { pct = h; color = C.high; }

    const bx = M + gap + i * (barW + gap);
    const bh = (pct / 100) * chartH;
    const by = chartBottom - bh;

    setFill(doc, color);
    doc.roundedRect(bx, by, barW, bh, 1, 1, "F");

    setColor(doc, C.gray);
    doc.setFontSize(6);
    const label = sanitize(s.dimension_name).length > 10
      ? sanitize(s.dimension_name).slice(0, 9) + "…"
      : sanitize(s.dimension_name);
    doc.text(label, bx + barW / 2, chartBottom + 4, { align: "center" });
  });

  y = chartBottom + 10;

  // Legend
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
