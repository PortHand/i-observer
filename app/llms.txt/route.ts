import { landingList } from "@/app/(view)/(pview)/_landing/content/landingContent";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { routes } from "@/helper/route";
import { absoluteUrl, seo } from "@/helper/seo";

// Served at /llms.txt (https://llmstxt.org): a plain summary of the site for AI assistants and
// AI search (ChatGPT, Claude, Perplexity, Gemini), with links to the pages that answer the most.

export function GET() {
  const link = (label: string, path: string, note: string) => `- [${label}](${absoluteUrl(path)}): ${note}`;
  const body = [
    `# ${appInfo.name}`,
    "",
    `> ${seo.description}`,
    "",
    "- Runs on macOS 12 or later (Apple Silicon and Intel) and Windows 10 or 11, 64-bit. Linux is coming soon.",
    "- Hidden from Zoom, Google Meet and Microsoft Teams screen shares, screen recordings and screenshots on macOS and Windows.",
    "- Embedded Chrome (Chromium) browser, 30 to 100% opacity, click-through and global keyboard shortcuts.",
    "- Paid once by UPI, with no auto-renewal; the login arrives by email within 24 hours.",
    `- Support: ${appInfo.supportEmail}`,
    "",
    "## Pages",
    "",
    link("Home", routes.home, "overview, demo video, platforms and pricing"),
    link("What is iOverlay?", routes.whatIsIOverlay, "how the hidden overlay works, its limits and who it's for"),
    ...landingList.map((page) => link(page.name, page.path, page.seo.description)),
    link("Get iOverlay", routes.getIOverlay, "plans, prices and checkout"),
    link("Contact and FAQ", routes.contact, "support and answers to common questions"),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
