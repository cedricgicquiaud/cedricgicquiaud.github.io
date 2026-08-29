import site from "../content/site.json";

export function Portrait() {
  return (
    <section id="portrait">
      <img src="/portrait.jpg" alt={`Portrait de ${site.name}`} />
    </section>
  );
}
