// Draws the payment receipt as a PNG in the browser, so it can be downloaded without a server.

import { receipt } from "../content/getContent";
import { receiptFooter, receiptRows, type TransactionSummary } from "./getHelper";

const WIDTH = 720;
const PADDING = 48;
const VALUE_X = 250;
const SCALE = 2;

// Fixed colors: the receipt is always printed light, whatever theme the page is in.
const colors = {
  paper: "#f7f6f0",
  ink: "#242321",
  muted: "#615f5a",
  rule: "rgba(36, 35, 33, 0.22)",
  accent: "#c83232",
  success: "#2f7d4f",
  successSoft: "rgba(47, 125, 79, 0.1)",
};

const cssFont = (variable: string, fallback: string) => {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family ? `${family}, ${fallback}` : fallback;
};

/** Splits text into lines that fit `maxWidth`, breaking long words (e.g. emails) by character. */
const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const char of word) {
      if (ctx.measureText(line + char).width > maxWidth && line) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export const renderReceiptPng = async (summary: TransactionSummary): Promise<Blob> => {
  await document.fonts.ready;
  const display = cssFont("--font-archivo-narrow", '"Arial Narrow", Arial, sans-serif');
  const mono = cssFont("--font-geist-mono", "ui-monospace, Menlo, monospace");
  const sans = "Arial, Helvetica, sans-serif";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  // The status is drawn as a badge under the title, so it isn't repeated as a row.
  const rows = receiptRows(summary).filter(({ label }) => label !== receipt.labels.status);
  const footer = receiptFooter();

  // Runs twice: once to measure the height, then again to draw at that size.
  const layout = (draw: boolean) => {
    let y = PADDING;
    ctx.textBaseline = "top";

    if (draw) {
      ctx.fillStyle = colors.paper;
      ctx.fillRect(0, 0, WIDTH, canvas.height / SCALE);
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, WIDTH, 6);
    }

    ctx.font = `700 12px ${mono}`;
    if (draw) {
      ctx.fillStyle = colors.accent;
      ctx.fillText("IOBSERVER", PADDING, y);
    }
    y += 24;

    ctx.font = `700 44px ${display}`;
    if (draw) {
      ctx.fillStyle = colors.ink;
      ctx.fillText(receipt.title.toUpperCase(), PADDING, y);
    }
    y += 56;

    ctx.font = `700 12px ${mono}`;
    const status = receipt.status.toUpperCase();
    const statusWidth = ctx.measureText(status).width + 20;
    if (draw) {
      ctx.fillStyle = colors.successSoft;
      ctx.fillRect(PADDING, y, statusWidth, 26);
      ctx.fillStyle = colors.success;
      ctx.fillText(status, PADDING + 10, y + 7);
    }
    y += 26 + 28;

    if (draw) {
      ctx.fillStyle = colors.ink;
      ctx.fillRect(PADDING, y, WIDTH - PADDING * 2, 1);
    }

    for (const { label, value } of rows) {
      y += 14;
      ctx.font = `15px ${mono}`;
      const lines = wrap(ctx, value, WIDTH - PADDING - VALUE_X);
      if (draw) {
        ctx.font = `700 11px ${mono}`;
        ctx.fillStyle = colors.muted;
        ctx.fillText(label.toUpperCase(), PADDING, y + 3);
        ctx.font = `15px ${mono}`;
        ctx.fillStyle = colors.ink;
        lines.forEach((line, index) => ctx.fillText(line, VALUE_X, y + index * 22));
      }
      y += lines.length * 22 + 12;
      if (draw) {
        ctx.fillStyle = colors.rule;
        ctx.fillRect(PADDING, y, WIDTH - PADDING * 2, 1);
      }
    }

    y += 24;
    ctx.font = `13px ${sans}`;
    for (const paragraph of footer) {
      for (const line of wrap(ctx, paragraph, WIDTH - PADDING * 2)) {
        if (draw) {
          ctx.fillStyle = colors.muted;
          ctx.fillText(line, PADDING, y);
        }
        y += 20;
      }
    }
    return y + PADDING;
  };

  const height = layout(false);
  canvas.width = WIDTH * SCALE;
  canvas.height = Math.ceil(height * SCALE);
  ctx.scale(SCALE, SCALE);
  layout(true);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't encode the receipt."))), "image/png"),
  );
};

export const receiptFileName = (reference: string) => `iobserver-receipt-${reference}.png`;
