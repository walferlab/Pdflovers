export function JsonLdScript({ data, id }) {
  const payload = Array.isArray(data) ? data : [data];

  return payload
    .filter(Boolean)
    .map((entry, index) => (
      <script
        key={`${id || "jsonld"}-${index}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
      />
    ));
}
