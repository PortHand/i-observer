/**
 * Structured data for search engines, as a JSON-LD script tag. Build the data with the helpers in
 * helper/seo.ts. "<" is escaped so text in the data can never close the script tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
