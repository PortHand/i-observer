// The theme chosen with the header switch (ThemeToggle.tsx), applied before the page renders.
// Kept out of the client component so the root layout (a server component) can inline the string.

export type Theme = "dark" | "light";

/** localStorage key holding the visitor's choice. */
export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before the page renders (app/layout.tsx): the saved theme, else the system's preference,
 * as `data-theme` on <html>. Plain ES5 in a string, since it runs ahead of every bundle.
 */
export const themeScript = `(function(){var t;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)})();`;
