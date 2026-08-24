export function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((item) => (
        <li key={item} className="resume-bullet">
          {item}
        </li>
      ))}
    </ul>
  );
}
