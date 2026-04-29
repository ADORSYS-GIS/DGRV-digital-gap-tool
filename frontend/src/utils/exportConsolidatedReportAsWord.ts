import {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle,
    ShadingType,
    Packer,
    Header,
    Footer,
} from "docx";
import { saveAs } from "file-saver";
import type { ConsolidatedReport } from "@/openapi-client/types.gen";
import type { ExportTranslations } from "./exportConsolidatedReport";

function sanitize(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/[^\x20-\x7E]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function riskLabel(level: number, t: ExportTranslations): string {
    return level < 1.5
        ? t.attention.riskLevels.low
        : level <= 2.5
            ? t.attention.riskLevels.medium
            : t.attention.riskLevels.high;
}

function riskHex(level: number): string {
    return level < 1.5 ? "16a34a" : level <= 2.5 ? "f59e0b" : "ef4444";
}

/** Creates a coloured heading-style row for the dimension table header */
function tableHeaderRow(cells: string[]): TableRow {
    return new TableRow({
        tableHeader: true,
        children: cells.map(
            (text) =>
                new TableCell({
                    shading: { type: ShadingType.SOLID, color: "1e40af", fill: "1e40af" },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text, bold: true, color: "FFFFFF", size: 18 }),
                            ],
                        }),
                    ],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                }),
        ),
    });
}

function dimensionRow(
    name: string,
    high: number,
    medium: number,
    low: number,
    shaded: boolean,
): TableRow {
    const fill = shaded ? "F8FAFC" : "FFFFFF";
    const make = (text: string, color: string) =>
        new TableCell({
            shading: { type: ShadingType.SOLID, color: fill, fill },
            borders: {
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [
                new Paragraph({
                    children: [new TextRun({ text, color, bold: color !== "0F172A", size: 18 })],
                }),
            ],
            width: { size: 25, type: WidthType.PERCENTAGE },
        });

    return new TableRow({
        children: [
            make(sanitize(name), "0F172A"),
            make(`${high.toFixed(2)}%`, "ef4444"),
            make(`${medium.toFixed(2)}%`, "d97706"),
            make(`${low.toFixed(2)}%`, "16a34a"),
        ],
    });
}

export async function exportConsolidatedReportAsWord(
    report: ConsolidatedReport,
    translations: ExportTranslations,
    organizationName?: string,
): Promise<void> {
    const date = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // ── Highest-risk dimension ───────────────────────────────────────────────
    const highest =
        report.dimension_summaries.length > 0
            ? report.dimension_summaries.reduce((a, b) => {
                if (a.average_risk_level !== b.average_risk_level) {
                    return a.average_risk_level > b.average_risk_level ? a : b;
                }
                return a.risk_level_distribution.high_risk_percentage >=
                    b.risk_level_distribution.high_risk_percentage
                    ? a
                    : b;
            })
            : null;

    const riskColor = highest ? riskHex(highest.average_risk_level) : "16a34a";
    const isHigh = highest ? highest.average_risk_level > 2.5 : false;
    const isMed = highest ? highest.average_risk_level >= 1.5 : false;

    const attentionTitle = isHigh
        ? translations.attention.title
        : isMed
            ? translations.attention.title
            : translations.attention.title;

    const attentionSubtitle = isHigh
        ? translations.attention.subtitles.high
        : isMed
            ? translations.attention.subtitles.medium
            : translations.attention.subtitles.low;

    // ── Dimension table rows ─────────────────────────────────────────────────
    const tableRows = [
        tableHeaderRow([
            translations.table.dimension,
            translations.table.highRisk,
            translations.table.mediumRisk,
            translations.table.lowRisk,
        ]),
        ...report.dimension_summaries.map((s, idx) =>
            dimensionRow(
                s.dimension_name,
                s.risk_level_distribution.high_risk_percentage,
                s.risk_level_distribution.medium_risk_percentage,
                s.risk_level_distribution.low_risk_percentage,
                idx % 2 === 0,
            ),
        ),
    ];

    // ── Attention section paragraphs ────────────────────────────────────────
    const attentionParagraphs: Paragraph[] = highest
        ? [
            new Paragraph({
                children: [
                    new TextRun({
                        text: attentionTitle,
                        bold: true,
                        size: 24,
                        color: riskColor,
                    }),
                ],
                spacing: { before: 300, after: 100 },
            }),
            new Paragraph({
                children: [new TextRun({ text: attentionSubtitle, color: "64748B", size: 18 })],
                spacing: { after: 150 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: sanitize(highest.dimension_name), bold: true, size: 22 }),
                ],
                spacing: { after: 80 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: `${translations.attention.avgScore} `, size: 18 }),
                    new TextRun({
                        text: riskLabel(highest.average_risk_level, translations),
                        color: riskColor,
                        bold: true,
                        size: 18,
                    }),
                ],
                spacing: { after: 150 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: translations.attention.recommendations, bold: true, size: 20 }),
                ],
                spacing: { after: 80 },
            }),
            ...(highest.top_recommendations ?? []).map(
                (rec) =>
                    new Paragraph({
                        bullet: { level: 0 },
                        children: [new TextRun({ text: sanitize(rec), size: 18 })],
                        spacing: { after: 60 },
                    }),
            ),
        ]
        : [];

    // ── Build document ──────────────────────────────────────────────────────
    const doc = new Document({
        sections: [
            {
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [
                                    new TextRun({ text: "DGRV – ", bold: true, color: "1e40af", size: 20 }),
                                    new TextRun({ text: translations.title, bold: true, size: 20 }),
                                ],
                                border: {
                                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "1e40af" },
                                },
                                spacing: { after: 100 },
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: translations.footer.generatedOn.replace("{{date}}", date),
                                        size: 16,
                                        color: "64748B",
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children: [
                    // Title block
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({ text: translations.title, bold: true, color: "1e40af", size: 40 }),
                        ],
                        spacing: { after: 80 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: organizationName
                                    ? `${organizationName}  ·  ${date}`
                                    : `${translations.digitalGapAnalysis}  ·  ${date}`,
                                color: "64748B",
                                size: 18,
                            }),
                        ],
                        spacing: { after: 300 },
                    }),

                    // Submissions card
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${translations.totalSubmissions}: `, size: 20, color: "64748B" }),
                            new TextRun({ text: String(report.total_submissions), bold: true, size: 26, color: "1e40af" }),
                        ],
                        border: {
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                            top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                            left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                            right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                        },
                        spacing: { before: 200, after: 400 },
                    }),

                    // Dimension Analysis heading
                    new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                            new TextRun({ text: translations.dimensionAnalysis, bold: true, size: 28 }),
                        ],
                        spacing: { after: 60 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: translations.riskDistributionDesc, color: "64748B", size: 18 })],
                        spacing: { after: 180 },
                    }),

                    // Dimension table
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: tableRows,
                    }),

                    // Attention section
                    ...attentionParagraphs,
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `consolidated-report-${new Date().toISOString().slice(0, 10)}.docx`);
}
