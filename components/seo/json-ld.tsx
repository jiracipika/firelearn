/**
 * Renders a JSON-LD structured data <script> tag in the page body.
 * Next.js App Router allows structured data via <script type="application/ld+json">
 * placed directly in the component tree.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
