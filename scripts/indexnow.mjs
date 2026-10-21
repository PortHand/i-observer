// Tells Bing, Yandex and the other IndexNow engines that the site's pages changed, so they recrawl
// them soon instead of whenever they next visit. Run it after a deploy that changes public pages:
//
//   npm run indexnow                                   (every URL in the live sitemap)
//   npm run indexnow -- /contact /get-ioverlay         (just these paths)
//
// It submits SITE_URL's live /sitemap.xml, so deploy first. The key is the 32-character file in
// public/ (served at /<key>.txt), which proves to the engines that we own the site. To change the
// key, replace that file with a new one: `openssl rand -hex 16`, saved as public/<key>.txt holding
// just the key. Google doesn't use IndexNow; use Search Console's "Request indexing" for it.

import { readdirSync } from "node:fs";
import nextEnv from "@next/env";
import { env } from "../server/core/env.ts";

nextEnv.loadEnvConfig(process.cwd(), !env.isProduction);

const keyFiles = readdirSync("public").filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (keyFiles.length !== 1) {
  console.error(`Expected one IndexNow key file in public/ (32 hex characters + .txt), found ${keyFiles.length}.`);
  process.exit(1);
}
const key = keyFiles[0].slice(0, -".txt".length);
const site = env.siteUrl;
const keyLocation = `${site}/${key}.txt`;

const live = await fetch(keyLocation);
if (!live.ok || (await live.text()).trim() !== key) {
  console.error(`${keyLocation} doesn't serve the key yet. Deploy, then run this again.`);
  process.exit(1);
}

const paths = process.argv.slice(2);
let urls;
if (paths.length > 0) {
  urls = paths.map((path) => new URL(path, `${site}/`).toString());
} else {
  const sitemap = await fetch(`${site}/sitemap.xml`);
  if (!sitemap.ok) {
    console.error(`Couldn't load ${site}/sitemap.xml (HTTP ${sitemap.status}).`);
    process.exit(1);
  }
  // Page URLs only: <image:loc> entries are images, not pages.
  urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation, urlList: urls }),
});

// 200: accepted. 202: accepted, key still being checked. Anything else is a problem with the request.
if (response.ok) {
  console.log(`Submitted ${urls.length} URL(s) to IndexNow (HTTP ${response.status}):`);
  for (const url of urls) console.log(`  ${url}`);
} else {
  console.error(`IndexNow refused the submission (HTTP ${response.status}): ${await response.text()}`);
  process.exitCode = 1;
}
