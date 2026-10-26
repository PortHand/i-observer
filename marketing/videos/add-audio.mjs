// Voiceover and music for the vertical reels in out/reels/ (light/, dark/ and combined/).
//
//   FFMPEG=<path to ffmpeg> node add-audio.mjs --timing   step 1: record the voice, write narration-timing.json
//   node render.mjs reel-…html out/silent/… --subs <id>   step 2: render (subtitles use the word timings)
//   FFMPEG=<path to ffmpeg> node add-audio.mjs            step 3: mix voice + music into every reel
//
// Voice: each video's narration (narration.json) is recorded by ElevenLabs as ONE continuous take,
// with a short pause between lines, so the intonation and energy flow naturally. The take is then
// cut only in the silence between lines, and each line is placed at its start time in the video.
// ElevenLabs also returns the time of every character, which gives the per-word subtitle timing.
// Takes are cached in voice-cache/ (same text, voice and model are reused, so re-runs are free).
// The API key comes from ELEVENLABS_API_KEY or the git-ignored .env next to this script.
//
// Music: an original ambient pad synthesised by ffmpeg (no licence needed). Its chords crossfade at
// constant power, so the level never dips; it sits gently under the voice.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "out");
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
const { videos, elevenlabs, continuous = [] } = JSON.parse(readFileSync(join(here, "narration.json"), "utf8"));
const timingOnly = process.argv.includes("--timing");
const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;

/** Pause ElevenLabs leaves between lines inside the take; the cuts fall in the middle of it. */
const LINE_BREAK = "0.7s";

/** Every reel: its narration, silent render and finished file. */
const names = { "meet-ioverlay": "1-meet-ioverlay", "how-to-use": "2-how-to-use", "use-cases": "3-use-cases" };
const reels = join(out, "reels");
const allJobs = ["light", "dark"].flatMap((theme) => [
  ...Object.entries(names).map(([id, name]) => ({
    id,
    silent: join(out, "silent", `reel-${name}-${theme}.mp4`),
    output: join(reels, theme, `${name}.mp4`),
  })),
  { id: "all", silent: join(out, "silent", `reel-0-iOverlay-all-${theme}.mp4`), output: join(reels, "combined", `iOverlay-all-${theme}.mp4`) },
]);
const jobs = only ? allJobs.filter((job) => job.id === only) : allJobs;

const elevenLabsKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const envFile = join(here, ".env");
  const match = existsSync(envFile) && readFileSync(envFile, "utf8").match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\n]+)"?/m);
  if (match) return match[1].trim();
  console.error("No ElevenLabs key: set ELEVENLABS_API_KEY or put ELEVENLABS_API_KEY=... in marketing/videos/.env");
  process.exit(1);
};

/** A take decoded to mono 16-bit samples at 48 kHz, for finding where speech starts and stops. */
const SAMPLE_RATE = 48000;
const decode = (file) => {
  const pcm = execFileSync(ffmpeg, ["-loglevel", "error", "-i", file, "-ac", "1", "-ar", String(SAMPLE_RATE), "-f", "s16le", "-"], {
    maxBuffer: 1 << 30,
  });
  return new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length / 2);
};

/** Level in dBFS of the 20 ms window starting at `time`. */
const level = (samples, time) => {
  const from = Math.max(0, Math.floor(time * SAMPLE_RATE));
  const to = Math.min(samples.length, from + SAMPLE_RATE / 50);
  let sum = 0;
  for (let i = from; i < to; i++) sum += samples[i] * samples[i];
  return 20 * Math.log10(Math.sqrt(sum / Math.max(1, to - from)) / 32768 + 1e-9);
};

/**
 * The audible extent of a line in the take: from the aligned start/end, walk outwards while the
 * voice is still audible (onsets and decays), stopping at the first quiet window — or, on the way
 * out, where the level starts rising again (a new sound, not the word's decay). Anything beyond —
 * breaths, clicks or artefacts in the pause — is left out.
 */
const QUIET_DB = -52;
const RISE_DB = 6;
const audibleSpan = (samples, start, end) => {
  let from = start;
  while (from > start - 0.25 && level(samples, from - 0.02) > QUIET_DB) from -= 0.02;
  let to = end;
  let lowest = level(samples, to);
  while (to < end + 0.4) {
    const now = level(samples, to);
    if (now <= QUIET_DB || now > lowest + RISE_DB) break;
    lowest = Math.min(lowest, now);
    to += 0.02;
  }
  return { from: Math.max(0, from - 0.01), to: to + 0.02 };
};

/**
 * Tighter span for continuous takes, which carry breaths between lines: start at the word itself
 * (the first window above SPEECH_DB, skipping a quieter breath-in) and end just after the last
 * aligned character (dropping the breathy exhale that follows).
 */
const SPEECH_DB = -45;
const speechSpan = (samples, start, end) => {
  let from = start - 0.15;
  while (from < start && level(samples, from) <= SPEECH_DB) from += 0.01;
  return { from: Math.max(0, from - 0.01), to: end + 0.05 };
};

/** Seconds of audio or video in a file. */
const duration = (file) => {
  const text = spawnSync(ffmpeg, ["-hide_banner", "-i", file], { encoding: "utf8" }).stderr;
  const [, h, m, s] = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

/**
 * One continuous take of a video's narration, with character timings. Returns the MP3 path and,
 * per line, where it is spoken in the take (start/end) and each word's start.
 */
const recordTake = async (id) => {
  const lines = videos[id];
  const { voiceId, model, settings } = elevenlabs;
  const parts = lines.map((line) => line.text);
  const text = parts.join(` <break time="${LINE_BREAK}" /> `);
  const hash = createHash("sha1").update(JSON.stringify([voiceId, model, settings, text])).digest("hex").slice(0, 12);
  const cacheDir = join(here, "voice-cache");
  mkdirSync(cacheDir, { recursive: true });
  const audioFile = join(cacheDir, `take-${hash}.mp3`);
  const alignFile = join(cacheDir, `take-${hash}.json`);

  if (!existsSync(audioFile) || !existsSync(alignFile)) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": elevenLabsKey(), "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: model, voice_settings: settings }),
    });
    if (!response.ok) {
      console.error(`ElevenLabs ${response.status}: ${(await response.text()).slice(0, 300)}`);
      process.exit(1);
    }
    const body = await response.json();
    writeFileSync(audioFile, Buffer.from(body.audio_base64, "base64"));
    writeFileSync(alignFile, JSON.stringify(body.alignment));
  }

  // Map each line's characters to times. The alignment covers the text we sent, break tags included.
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = JSON.parse(
    readFileSync(alignFile, "utf8"),
  );
  const spoken = characters.join("");
  let cursor = 0;
  const segments = parts.map((part) => {
    const from = spoken.indexOf(part, cursor);
    if (from < 0) throw new Error(`Line not found in alignment: "${part}"`);
    cursor = from + part.length;
    const words = [];
    for (const match of part.matchAll(/\S+/g)) words.push({ text: match[0], t: starts[from + match.index] });
    return { start: starts[from], end: ends[from + part.length - 1], words };
  });
  return { audioFile, segments };
};

/**
 * Ambient pad: Cmaj9 → Am9 → Fmaj7 → G6, 4 s each, looping. Each chord's weight is cos² of its
 * distance from its centre, so neighbouring chords always sum to 1: smooth, constant level.
 */
const padExpression = () => {
  const chords = [
    [130.81, 196.0, 246.94, 293.66, 329.63],
    [110.0, 164.81, 196.0, 246.94, 261.63],
    [87.31, 174.61, 220.0, 261.63, 329.63],
    [98.0, 146.83, 196.0, 246.94, 329.63],
  ];
  const terms = chords.map((notes, index) => {
    const centre = index * 4 + 2;
    const distance = `(mod(mod(t,16)-${centre}+8,16)-8)`;
    const weight = `lt(abs(${distance}),4)*pow(cos(PI*${distance}/8),2)`;
    const tones = notes
      .map((f, n) => `${n === 0 ? 0.9 : 0.5}*(sin(2*PI*${f}*t)+sin(2*PI*${(f * 1.004).toFixed(3)}*t))`)
      .join("+");
    return `${weight}*(${tones})`;
  });
  return `0.06*(${terms.join("+")})`;
};

// Record or load each narration's take, and check each line fits before the next one starts.
const plans = {};
for (const id of new Set(jobs.map((job) => job.id))) {
  let lines = videos[id];
  const take = await recordTake(id);
  // Continuous videos play the take uncut: each line starts where the take has it, shifted so the
  // first line starts at its time. The video's scenes are timed to these starts.
  if (continuous.includes(id)) {
    const offset = lines[0].at - take.segments[0].start;
    lines = lines.map((line, index) => ({ ...line, at: +(offset + take.segments[index].start).toFixed(2) }));
  }
  plans[id] = { ...take, lines };
  const silent = jobs.find((job) => job.id === id).silent;
  const videoEnd = existsSync(silent) ? duration(silent) : Infinity;
  lines.forEach((line, index) => {
    const { start, end } = take.segments[index];
    const length = end - start;
    const next = lines[index + 1]?.at ?? videoEnd;
    const warn = line.at + length > next - 0.1 ? "  ⚠ runs into the next line" : "";
    console.log(`${id} @${line.at}s  ${length.toFixed(2)}s  "${line.text}"${warn}`);
  });
}

// Word timings for the animated subtitles, in video time.
const timing = Object.fromEntries(
  Object.entries(plans).map(([id, { lines, segments }]) => [
    id,
    lines.map((line, index) => {
      const { start, end, words } = segments[index];
      return {
        at: line.at,
        end: +(line.at + (end - start)).toFixed(3),
        words: words.map((word) => ({ text: word.text, t: +(line.at + word.t - start).toFixed(3) })),
      };
    }),
  ]),
);
// Merge, so a run with --only keeps the other reels' timings.
const timingFile = join(here, "narration-timing.json");
const previous = existsSync(timingFile) ? JSON.parse(readFileSync(timingFile, "utf8")) : {};
writeFileSync(timingFile, `${JSON.stringify({ ...previous, ...timing }, null, 2)}\n`);
console.log("→ narration-timing.json");
if (timingOnly) process.exit(0);

const tmp = join(out, `tmp-audio-${process.pid}`);
mkdirSync(tmp, { recursive: true });

for (const { id, silent, output } of jobs) {
  const { audioFile, segments, lines } = plans[id];
  const length = duration(silent);

  // Keep only each line's audible span (dropping anything stray in the pauses), and place it so
  // the line starts on time. For continuous videos the line times come from the take, so this
  // keeps the take's own timing and pauses exactly, and only silences what's between the lines.
  const samples = decode(audioFile);
  const cuts = segments.map((segment, index) => {
    const span = continuous.includes(id) ? speechSpan : audibleSpan;
    const { from, to } = span(samples, segment.start, segment.end);
    const delay = Math.max(0, lines[index].at - (segment.start - from));
    return { from, to, delay };
  });
  const voice = [
    `[2:a]aresample=48000,aformat=channel_layouts=stereo,asplit=${cuts.length}${cuts.map((_, i) => `[s${i}]`).join("")}`,
    ...cuts.map(
      ({ from, to, delay }, i) =>
        `[s${i}]atrim=start=${from.toFixed(3)}:end=${to.toFixed(3)},asetpts=PTS-STARTPTS,` +
        `afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, to - from - 0.06).toFixed(3)}:d=0.06,` +
        `adelay=${Math.round(delay * 1000)}:all=1[p${i}]`,
    ),
    `${cuts.map((_, i) => `[p${i}]`).join("")}amix=inputs=${cuts.length}:normalize=0,volume=1.5,asplit=2[vo][side]`,
  ].join(";");
  const music = [
    `[1:a]aformat=channel_layouts=stereo,lowpass=f=2400,aecho=0.8:0.6:70|140:0.25|0.15`,
    `afade=t=in:d=1.5,afade=t=out:st=${(length - 2.5).toFixed(2)}:d=2.5[pad]`,
  ].join(",");
  // Gentle, slow duck: the music settles under the voice and stays there through short pauses.
  const ducked = "[pad][side]sidechaincompress=threshold=0.05:ratio=2.5:attack=200:release=2500[bed]";
  const final = "[bed][vo]amix=inputs=2:normalize=0[mix]";

  // Pass 1: mix to WAV and measure loudness.
  const mixed = join(tmp, `${id}-mix.wav`);
  execFileSync(
    ffmpeg,
    [
      "-loglevel", "error", "-y",
      "-f", "lavfi", "-t", String(length), "-i", "anullsrc=r=48000:cl=stereo",
      "-f", "lavfi", "-t", String(length), "-i", `aevalsrc='${padExpression()}':s=48000`,
      "-i", audioFile,
      "-filter_complex", [voice, music, ducked, final].join(";"),
      "-map", "[mix]", "-t", String(length), "-c:a", "pcm_s24le", mixed,
    ],
    { stdio: "inherit" },
  );
  const report = spawnSync(ffmpeg, ["-hide_banner", "-i", mixed, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr;
  const stats = JSON.parse(report.match(/\{[^{}]*"input_i"[^{}]*\}/)[0]);

  // Pass 2: one fixed gain to about -16 LUFS (linear: the level never rides between lines), then mux.
  const normalize =
    "loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:" +
    `measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:` +
    `measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}`;
  mkdirSync(dirname(output), { recursive: true });
  execFileSync(
    ffmpeg,
    [
      "-loglevel", "error", "-y",
      "-i", silent, "-i", mixed,
      "-map", "0:v", "-map", "1:a", "-af", `${normalize},aresample=48000`,
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(length), "-movflags", "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  console.log(`→ ${output.slice(out.length + 1)} (${length}s)`);
}

rmSync(tmp, { recursive: true, force: true });
