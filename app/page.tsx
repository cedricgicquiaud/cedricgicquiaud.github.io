import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Intro } from "@/components/intro";
import { Projects } from "@/components/projects";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 lg:px-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="flex flex-col justify-between py-16 lg:sticky lg:top-0 lg:h-screen lg:py-24">
          <Intro />
        </div>
        <div>
          <About />
          <Experience />
          <Projects />
        </div>
      </div>
    </main>
  );
}
