import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-screen-xl flex-1 px-6 lg:px-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)] lg:gap-24">
        <div className="flex flex-col justify-between py-16 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:py-16">
          <Intro />
        </div>
        <div className="max-w-2xl">
          <About />
          <Experience />
          <Projects />
        </div>
      </div>
    </main>
  );
}
