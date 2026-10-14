// Builds the PDF receipt in the browser: the order details, then the customer's payment screenshot.

import { receipt } from "../content/getContent";
import { receiptFooter, receiptRows, type TransactionSummary } from "./getHelper";

// A4 portrait, in millimetres.
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const VALUE_X = 72;

// Fixed colors: the receipt is always printed light, whatever theme the page is in.
const colors = {
  ink: [36, 35, 33],
  muted: [97, 95, 90],
  rule: [214, 213, 208],
  accent: [200, 50, 50],
  success: [47, 125, 79],
  successSoft: [232, 241, 235],
} as const;

type Rgb = readonly [number, number, number];

const imageSize = (dataUrl: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Couldn't read the screenshot."));
    image.src = dataUrl;
  });

/** `screenshot` is the uploaded image as a data URL, or null if none was attached or it's gone. */
export const renderReceiptPdf = async (summary: TransactionSummary, screenshot: string | null) => {
  // Loaded on demand so the PDF library stays out of the page bundle.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const fill = (color: Rgb) => doc.setFillColor(color[0], color[1], color[2]);
  const text = (color: Rgb) => doc.setTextColor(color[0], color[1], color[2]);
  const draw = (color: Rgb) => doc.setDrawColor(color[0], color[1], color[2]);

  fill(colors.accent);
  doc.rect(0, 0, PAGE_WIDTH, 3, "F");

  let y = MARGIN + 4;
  doc.setFont("courier", "bold").setFontSize(9);
  text(colors.accent);
  doc.text("IOVERLAY", MARGIN, y);

  y += 11;
  doc.setFont("helvetica", "bold").setFontSize(24);
  text(colors.ink);
  doc.text(receipt.title.toUpperCase(), MARGIN, y);

  // Success badge: a green tick in a circle beside "Order successful".
  y += 9;
  fill(colors.successSoft);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 18, "F");
  fill(colors.success);
  doc.circle(MARGIN + 9, y + 9, 4.5, "F");
  doc.setDrawColor(255, 255, 255).setLineWidth(0.9);
  doc.lines(
    [
      [1.6, 1.6],
      [3.2, -3.4],
    ],
    MARGIN + 6.8,
    y + 9.2,
  );
  doc.setFont("helvetica", "bold").setFontSize(12);
  text(colors.success);
  doc.text(receipt.badge, MARGIN + 17, y + 7.5);
  doc.setFont("helvetica", "normal").setFontSize(9.5);
  text(colors.ink);
  doc.text(receipt.message.replace("{email}", summary.email), MARGIN + 17, y + 13);

  y += 28;
  draw(colors.ink);
  doc.setLineWidth(0.4).line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  for (const { label, value } of receiptRows(summary)) {
    y += 6.5;
    doc.setFont("courier", "normal").setFontSize(10);
    const lines: string[] = doc.splitTextToSize(value, PAGE_WIDTH - MARGIN - VALUE_X);
    doc.setFont("helvetica", "bold").setFontSize(7.5);
    text(colors.muted);
    doc.text(label.toUpperCase(), MARGIN, y);
    doc.setFont("courier", "normal").setFontSize(10);
    text(colors.ink);
    doc.text(lines, VALUE_X, y);
    y += (lines.length - 1) * 4.5 + 3.5;
    draw(colors.rule);
    doc.setLineWidth(0.2).line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  }

  y += 8;
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  text(colors.muted);
  for (const paragraph of receiptFooter()) {
    const lines: string[] = doc.splitTextToSize(paragraph, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.2;
  }

  // Screenshot: below the details when it fits well, otherwise on its own page.
  y += 8;
  const heading = () => {
    doc.setFont("helvetica", "bold").setFontSize(11);
    text(colors.ink);
    doc.text(receipt.screenshotTitle.toUpperCase(), MARGIN, y);
    y += 6;
  };

  if (!screenshot) {
    heading();
    doc.setFont("helvetica", "normal").setFontSize(9.5);
    text(colors.muted);
    doc.text(summary.screenshotName ? receipt.screenshotUnavailable : receipt.screenshotMissing, MARGIN, y);
  } else {
    const { width, height } = await imageSize(screenshot);
    const fullPageHeight = PAGE_HEIGHT - MARGIN * 2 - 6;
    let scale = Math.min(CONTENT_WIDTH / width, fullPageHeight / height);
    if (height * scale > PAGE_HEIGHT - MARGIN - y - 6) {
      doc.addPage();
      y = MARGIN + 4;
    }
    heading();
    scale = Math.min(scale, (PAGE_HEIGHT - MARGIN - y) / height);
    const format = screenshot.startsWith("data:image/png") ? "PNG" : "JPEG";
    draw(colors.rule);
    doc.setLineWidth(0.2).rect(MARGIN, y, width * scale, height * scale);
    doc.addImage(screenshot, format, MARGIN, y, width * scale, height * scale);
  }

  // Reference on every page, so loose pages can still be matched to the order.
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("courier", "normal").setFontSize(7.5);
    text(colors.muted);
    doc.text(`${summary.reference} · ${page}/${pages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: "right" });
  }

  return doc.output("blob");
};

export const receiptFileName = (reference: string) => `ioverlay-receipt-${reference}.pdf`;
