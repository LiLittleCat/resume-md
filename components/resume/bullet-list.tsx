export function BulletList({ items, paginated = false }: { items: string[]; paginated?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((item) => (
        <li
          key={item}
          className="resume-bullet"
          data-box={paginated ? "project-bullet" : undefined}
          data-keep-together={paginated ? "true" : undefined}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
