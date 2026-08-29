import site from "../content/site.json";

export function Intro() {
  return (
    <section id="intro">
      <h1>{site.name}</h1>
      <p>{site.title}</p>
      <ul>
        <li>
          <a href={site.links.github}>GitHub</a>
        </li>
        <li>
          <a href={site.links.linkedin}>LinkedIn</a>
        </li>
        <li>
          <a href={`mailto:${site.email}`}>Mail</a>
        </li>
      </ul>
    </section>
  );
}
