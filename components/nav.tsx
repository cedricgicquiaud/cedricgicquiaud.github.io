const entries = [
  { label: "À propos", id: "a-propos" },
  { label: "Expérience", id: "experience" },
  { label: "Projets", id: "projets" },
  { label: "Contact", id: "contact" },
];

export function Nav() {
  return (
    <nav aria-label="Sections">
      <ul>
        {entries.map(({ label, id }) => (
          <li key={id}>
            <a href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
