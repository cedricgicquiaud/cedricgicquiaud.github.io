import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Intro } from "@/components/intro";
import { Portrait } from "@/components/portrait";
import { Projects } from "@/components/projects";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Intro />
      <Portrait />
      <About />
      <Experience />
      <Projects />
    </main>
  );
}
