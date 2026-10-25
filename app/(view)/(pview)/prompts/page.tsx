import type { Metadata } from "next";
import "./prompts.css";
import JsonLd from "@/components/common/JsonLd";
import { homeSections, routes } from "@/helper/route";
import { breadcrumbJsonLd, pageMetadata } from "@/helper/seo";
import Closing from "../home/components/Closing";
import PageHero from "../home/components/PageHero";
import SectionHeader from "../home/components/SectionHeader";
import SiteFooter from "../home/components/SiteFooter";
import SiteHeader from "../home/components/SiteHeader";
import StepList from "../home/components/StepList";
import PromptLibrary from "./components/PromptLibrary";
import { closing, commands, howTo, intro, library } from "./content/promptsContent";

export const metadata: Metadata = pageMetadata({
  title: "Interview Practice Prompts for Developers",
  description:
    "Free copy-paste AI prompts that turn ChatGPT, Claude or Gemini into a mock interviewer for React/Next.js, Flutter, MERN and software engineer roles, with DSA, system design and behavioural practice.",
  path: routes.prompts,
  ownShareImage: true,
});

export default function PromptsView() {
  return (
    <>
      <SiteHeader current={routes.prompts} />
      <main>
        <section className="band" id={homeSections.top}>
          <PageHero {...intro} className="container" />
        </section>
        <section className="band">
          <div className="container section section--compact">
            <SectionHeader {...howTo} />
            <StepList items={howTo.steps} />
          </div>
        </section>
        <section className="band band--light" id="library">
          <div className="container section">
            <SectionHeader eyebrow={library.eyebrow} title={library.title} lead={library.lead} />
            <PromptLibrary />
            <p className="prompt-note text-muted">{library.note}</p>
            <div className="prompt-commands" data-reveal>
              <h3 className="prompt-commands__title mono">{library.commandsTitle}</h3>
              <ul>
                {commands.map(({ command, meaning }) => (
                  <li key={command}>
                    <code>{command}</code>
                    <span className="text-muted">{meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <Closing {...closing} />
      </main>
      <SiteFooter />
      <JsonLd data={breadcrumbJsonLd("Interview practice prompts", routes.prompts)} />
    </>
  );
}
