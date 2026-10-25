// Adds a voiceover and a generated music bed to the rendered videos (out/*.mp4).
//
//   FFMPEG=<path to ffmpeg> node add-audio.mjs                       (all 12: 3 videos × landscape/reel × dark/light)
//   FFMPEG=<path to ffmpeg> node add-audio.mjs <narration id> <silent.mp4> <out.mp4>   (one video)
//   … --tts elevenlabs        speak with ElevenLabs instead of macOS `say` (natural voices)
//   … --lines-only            only make the voice lines and print their lengths (to plan timing)
//
// Narration lines and their start times are in narration.json. By default each is spoken with the
// macOS `say` voice set there; with --tts elevenlabs, with the ElevenLabs voice and model set there.
// The ElevenLabs key comes from ELEVENLABS_API_KEY or a git-ignored .env file next to this script,
// never from code. ElevenLabs lines are cached in voice-cache/ (same text, voice and model are
// reused), so rendering the light and dark versions is only charged once. The music is an original ambient chord pad synthesised by ffmpeg, so it
// carries no licence. It ducks under the voice automatically. Reads the silent renders from
// out/silent/ (render.mjs output) and writes the videos with sound to out/.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "out");
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
const { voice, rate, videos, elevenlabs } = JSON.parse(readFileSync(join(here, "narration.json"), "utf8"));

const flags = process.argv.slice(2);
const flag = (name) => {
  const index = flags.indexOf(name);
  if (index < 0) return undefined;
  const [, value] = flags.splice(index, 2);
  return value ?? true;
};
const tts = flag("--tts") ?? "say";
const linesOnly = flags.includes("--lines-only") && flags.splice(flags.indexOf("--lines-only"), 1);

/** The ElevenLabs key: environment first, then a KEY=value line in .env next to this script. */
const elevenLabsKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const envFile = join(here, ".env");
  if (existsSync(envFile)) {
    const match = readFileSync(envFile, "utf8").match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\n]+)"?/m);
    if (match) return match[1].trim();
  }
  console.error("No ElevenLabs key: set ELEVENLABS_API_KEY or put ELEVENLABS_API_KEY=... in marketing/videos/.env");
  process.exit(1);
};

/**
 * One line spoken by ElevenLabs, as an MP3 in voice-cache/. The neighbouring lines are sent as
 * context so the intonation flows from one line to the next.
 */
const speakElevenLabs = async (lines, index) => {
  const { voiceId, model, settings } = elevenlabs;
  const text = lines[index].text;
  const hash = createHash("sha1").update(JSON.stringify([voiceId, model, settings, text])).digest("hex").slice(0, 12);
  const cacheDir = join(here, "voice-cache");
  mkdirSync(cacheDir, { recursive: true });
  const file = join(cacheDir, `${hash}.mp3`);
  if (existsSync(file)) return file;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": elevenLabsKey(), "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: settings,
      previous_text: lines[index - 1]?.text,
      next_text: lines[index + 1]?.text,
    }),
  });
  if (!response.ok) {
    console.error(`ElevenLabs ${response.status}: ${(await response.text()).slice(0, 300)}`);
    process.exit(1);
  }
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  return file;
};

const files = { "meet-ioverlay": "1-meet-ioverlay", "how-to-use": "2-how-to-use", "use-cases": "3-use-cases" };

/** What to process: one video from the command line, else every format and theme of all three. */
const [argId, argSilent, argOut] = flags;
const variants = ["", "reel-"].flatMap((format) => ["dark", "light"].map((theme) => ({ format, theme })));
const jobs = argId
  ? [{ id: argId, silent: argSilent, output: argOut }]
  : Object.entries(files).flatMap(([id, name]) =>
      variants.map(({ format, theme }) => {
        const file = `${format}${name}-${theme}.mp4`;
        return { id, silent: join(out, "silent", file), output: join(out, file) };
      }),
    );

/** Seconds of audio or video in a file, read from ffmpeg's banner. */
const duration = (file) => {
  let text = "";
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (error) {
    text = error.stderr.toString();
  }
  const [, h, m, s] = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

/**
 * A slow four-chord ambient pad (Cmaj9 → Am9 → Fmaj7 → G6, 4 s each, looping), each chord
 * swelling in and out, with a soft root an octave down. Detuned pairs give it width.
 */
const padExpression = () => {
  const chords = [
    [130.81, 196.0, 246.94, 293.66, 329.63],
    [110.0, 164.81, 196.0, 246.94, 261.63],
    [87.31, 174.61, 220.0, 261.63, 329.63],
    [98.0, 146.83, 196.0, 246.94, 329.63],
  ];
  const terms = chords.map((notes, index) => {
    const tones = notes
      .map((f, n) => `${n === 0 ? 0.9 : 0.5}*(sin(2*PI*${f}*t)+sin(2*PI*${(f * 1.004).toFixed(3)}*t))`)
      .join("+");
    return `between(mod(t,16),${index * 4},${index * 4 + 4})*(${tones})`;
  });
  const swell = "pow(sin(PI*mod(t,4)/4),0.7)";
  return `0.11*${swell}*(${terms.join("+")})`;
};

// Per-run scratch folder, so two runs at once can't overwrite each other's voice files.
const tmp = join(out, `tmp-audio-${process.pid}`);
mkdirSync(tmp, { recursive: true });

for (const { id, silent, output } of jobs) {
  const lines = videos[id];
  const length = existsSync(silent) ? duration(silent) : Infinity;

  // Speak each line, and warn if one runs into the next.
  const voices = [];
  for (const [index, line] of lines.entries()) {
    let file = join(tmp, `${id}-${index}.aiff`);
    if (tts === "elevenlabs") file = await speakElevenLabs(lines, index);
    else execFileSync("say", ["-v", voice, "-r", String(rate), "-o", file, line.text]);
    const spoken = duration(file);
    const next = lines[index + 1]?.at ?? length;
    const status = line.at + spoken > next - 0.15 ? "  ⚠ overlaps the next line" : "";
    console.log(`${id} @${line.at}s  ${spoken.toFixed(2)}s  "${line.text}"${status}`);
    voices.push({ file, at: line.at });
  }
  if (linesOnly) continue;

  const inputs = voices.flatMap(({ file }) => ["-i", file]);
  const delayed = voices
    .map(({ at }, index) => `[${index + 2}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(at * 1000)}:all=1,volume=1.6[v${index}]`)
    .join(";");
  const voiceMix = `${voices.map((_, index) => `[v${index}]`).join("")}amix=inputs=${voices.length}:normalize=0,asplit=2[vo][side]`;
  const music = [
    `[1:a]aformat=channel_layouts=stereo,lowpass=f=2200,aecho=0.8:0.6:70|140:0.25|0.15`,
    `afade=t=in:d=1.5,afade=t=out:st=${(length - 2.5).toFixed(2)}:d=2.5[pad]`,
  ].join(",");
  const ducked = "[pad][side]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=500[bed]";
  // Even loudness across videos: about -16 LUFS, the usual level for social video.
  const final = "[bed][vo]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[mix]";

  execFileSync(
    ffmpeg,
    [
      "-loglevel", "error", "-y",
      "-i", silent,
      "-f", "lavfi", "-t", String(length), "-i", `aevalsrc='${padExpression()}':s=48000`,
      ...inputs,
      "-filter_complex", [delayed, voiceMix, music, ducked, final].join(";"),
      "-map", "0:v", "-map", "[mix]",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(length), "-movflags", "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  console.log(`→ ${output} (${length}s, with audio)\n`);
}

rmSync(tmp, { recursive: true, force: true });
