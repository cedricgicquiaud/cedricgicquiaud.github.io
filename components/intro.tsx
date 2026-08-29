import site from "../content/site.json";

export function Intro() {
  return (
    <section id="intro">
      <h1>{site.name}</h1>
      <p>{site.title}</p>
    </section>
  );
}
