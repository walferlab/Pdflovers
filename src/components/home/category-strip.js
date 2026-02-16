import Link from "next/link";

export function CategoryStrip({ categories }) {
  return (
    <div className="category-strip">
      {categories.map((category) => (
        <Link key={category} href={`/library?q=${encodeURIComponent(category)}`}>
          {category}
        </Link>
      ))}
    </div>
  );
}
