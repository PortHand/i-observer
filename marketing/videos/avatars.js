// Illustrated meeting participants for the marketing videos. Any element with data-avatar="<name>"
// gets that person's avatar (a simple flat portrait, not a real person) and a name tag, like a
// video-call tile. Runs once on load, before render.mjs starts seeking the animations.

const PEOPLE = {
  aisha: { skin: "#c68a5d", hair: "#1f140f", shirt: "#8f6bff", bg: "#2a2350", style: "long" },
  rahul: { skin: "#9c6a45", hair: "#120c09", shirt: "#4f8cff", bg: "#1d2a4a", style: "short" },
  maya: { skin: "#f1c7a5", hair: "#8a3b1c", shirt: "#22b8a5", bg: "#1b3a3a", style: "bun" },
  daniel: { skin: "#e8b48f", hair: "#5a3a22", shirt: "#ff6b7f", bg: "#3a1f2c", style: "short" },
  priya: { skin: "#a8724c", hair: "#0e0a08", shirt: "#3ddc97", bg: "#183a2c", style: "long" },
  leo: { skin: "#6b4430", hair: "#0b0807", shirt: "#ffb84d", bg: "#3a2e18", style: "curly" },
  sam: { skin: "#f5d0b5", hair: "#c9a063", shirt: "#5b7cff", bg: "#20254a", style: "short" },
};

const HAIR = {
  short: '<path class="hair" d="M37 52c-2-20 10-30 23-30s25 10 23 30c-3-9-11-14-23-14s-20 5-23 14z"/>',
  long: '<path class="hair" d="M34 86c-6-20-6-46 4-58 6-8 14-10 22-10s16 2 22 10c10 12 10 38 4 58-4-14-4-30-6-38-6 4-14 6-20 6s-14-2-20-6c-2 8-2 24-6 38z"/>',
  bun: '<circle class="hair" cx="60" cy="18" r="10"/><path class="hair" d="M37 54c-2-21 10-31 23-31s25 10 23 31c-4-10-12-15-23-15s-19 5-23 15z"/>',
  curly:
    '<path class="hair" d="M36 50c-6-6-2-16 6-18 0-8 10-12 16-8 6-6 16-2 18 4 8 0 12 10 8 16 4 4 2 10-2 12-4-10-12-14-22-14s-20 4-24 14c-4-2-4-4 0-6z"/>',
};

const avatar = (person) => `
  <svg class="avatar" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="120" height="120" fill="${person.bg}"/>
    <path fill="${person.shirt}" d="M18 120c0-26 18-40 42-40s42 14 42 40z"/>
    <rect fill="${person.skin}" x="52" y="62" width="16" height="20" rx="6"/>
    <ellipse fill="${person.skin}" cx="60" cy="50" rx="21" ry="24"/>
    <g fill="${person.hair}">${HAIR[person.style]}</g>
    <circle fill="#1a1410" cx="52" cy="52" r="2.2"/><circle fill="#1a1410" cx="68" cy="52" r="2.2"/>
    <path d="M53 62q7 5 14 0" stroke="#1a1410" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>`;

for (const tile of document.querySelectorAll("[data-avatar]")) {
  const key = tile.dataset.avatar;
  const person = PEOPLE[key];
  if (!person) continue;
  const name = key.charAt(0).toUpperCase() + key.slice(1);
  tile.insertAdjacentHTML("afterbegin", avatar(person));
  if (!tile.hasAttribute("data-no-name")) tile.insertAdjacentHTML("beforeend", `<span class="person__name">${name}</span>`);
}
