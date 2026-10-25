// Renders a marketing video page to MP4, frame by frame, so motion is smooth and text is sharp.
//
//   PLAYWRIGHT=<path to the playwright package> FFMPEG=<path to an ffmpeg with libx264> \
//     node render.mjs meet-ioverlay.html out/silent/1-meet-ioverlay.mp4   (then add-audio.mjs)
//   node render.mjs meet-ioverlay.html --stills 2,8,15   (preview frames as PNGs in out/)
//   --subs <narration id>   burn in subtitles from narration.json (used by the reels)
//   --theme <light|dark>    set data-theme on <html>; each stylesheet defines both looks
//
// Each page sets window.DURATION (seconds), optionally window.SIZE ([width, height], default
// 1920×1080), and animates only with CSS; this script pauses every animation and seeks it to
// each frame's time before taking a screenshot.

import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT ?? "playwright");

const FPS = 30;
const [input, ...rest] = process.argv.slice(2);
const stillsArg = rest.indexOf("--stills");
const stills = stillsArg >= 0 ? rest[stillsArg + 1].split(",").map(Number) : null;
const subsArg = rest.indexOf("--subs");
const subsId = subsArg >= 0 ? rest[subsArg + 1] : null;
const themeArg = rest.indexOf("--theme");
const theme = themeArg >= 0 ? rest[themeArg + 1] : null;
const output = stills ? null : rest[0];
if (!input || (!stills && !output)) {
  console.error("Usage: node render.mjs <page.html> <out.mp4> | --stills 1,2,3");
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: process.env.CHROME });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const [width, height] = await page.evaluate(() => window.SIZE ?? [1920, 1080]);
await page.setViewportSize({ width, height });
if (theme) await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);

// Subtitles: one per narration line, shown from its start until the next line starts.
if (subsId) {
  const { videos } = JSON.parse(readFileSync(resolve(dirname(input), "narration.json"), "utf8"));
  const lines = videos[subsId];
  const end = await page.evaluate(() => window.DURATION);
  await page.evaluate(
    ({ lines, end }) => {
      const frame = document.querySelector(".frame");
      lines.forEach((line, index) => {
        const until = Math.min(lines[index + 1]?.at ?? end, end) - 0.1;
        const sub = document.createElement("div");
        sub.className = "sub";
        sub.style.setProperty("--t0", `${line.at}s`);
        sub.style.setProperty("--t1", `${until}s`);
        const text = document.createElement("span");
        text.textContent = line.text;
        sub.append(text);
        frame.append(sub);
      });
    },
    { lines, end },
  );
}

const seek = (seconds) =>
  page.evaluate((ms) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = ms;
    }
  }, seconds * 1000);

if (stills) {
  const dir = resolve(dirname(input), "out");
  mkdirSync(dir, { recursive: true });
  for (const time of stills) {
    await seek(time);
    const file = `${dir}/${basename(input, ".html")}${theme ? `-${theme}` : ""}-${time}s.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
} else {
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);
  mkdirSync(dirname(resolve(output)), { recursive: true });
  const ffmpeg = spawn(
    process.env.FFMPEG ?? "ffmpeg",
    [
      "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
      // Screenshots are full-range RGB; convert to standard video range so every player shows true colours.
      "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
      "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
      "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-movflags", "+faststart", output,
    ],
    { stdio: ["pipe", "ignore", "inherit"] },
  );
  const done = new Promise((ok, fail) => ffmpeg.on("close", (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))));
  for (let frame = 0; frame < frames; frame++) {
    await seek(frame / FPS);
    const image = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ffmpeg.stdin.write(image)) await new Promise((ok) => ffmpeg.stdin.once("drain", ok));
    if (frame % (FPS * 5) === 0) console.log(`${basename(output)}: ${Math.round((frame / frames) * 100)}%`);
  }
  ffmpeg.stdin.end();
  await done;
  console.log(`${output}: ${duration}s, ${frames} frames`);
}

// Closing Chrome can hang after a long render; the output is already written, so exit outright.
await Promise.race([browser.close(), new Promise((ok) => setTimeout(ok, 5000))]);
process.exit(0);
