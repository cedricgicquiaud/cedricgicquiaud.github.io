import { existsSync } from "node:fs";
import path from "node:path";
import site from "../content/site.json";

const PHOTO = "/portrait.jpg";
const PLACEHOLDER = "/portrait-placeholder.svg";

/** Vrai dès que `public/portrait.jpg` est présent (évalué au build, export statique). */
export function hasPortraitPhoto(): boolean {
  return existsSync(path.join(process.cwd(), "public", PHOTO));
}

type Props = { photoExists?: boolean };

export function Portrait({ photoExists = hasPortraitPhoto() }: Props) {
  return (
    <section id="portrait" className="py-16">
      <figure className="w-full">
        <div className="w-40 overflow-hidden rounded-lg bg-primary sm:w-48">
          <img
            src={photoExists ? PHOTO : PLACEHOLDER}
            alt={`Portrait de ${site.name}`}
            width={480}
            height={600}
            className="block h-auto w-full grayscale contrast-110 mix-blend-multiply dark:mix-blend-screen"
          />
        </div>
      </figure>
    </section>
  );
}
