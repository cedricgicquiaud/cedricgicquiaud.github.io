import site from "../content/site.json";

const links = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "Mail", href: `mailto:${site.email}` },
];

export function SocialIcons() {
  return (
    <ul>
      {links.map(({ label, href }) => (
        <li key={label}>
          <a href={href} aria-label={label} title={label} />
        </li>
      ))}
    </ul>
  );
}
