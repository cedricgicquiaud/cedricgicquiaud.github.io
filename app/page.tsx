import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Intro } from "@/components/intro";
import { Nav } from "@/components/nav";
import { Portrait } from "@/components/portrait";
import { Projects } from "@/components/projects";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="fixed right-4 top-16 z-50 lg:top-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 flex-col">
        <Intro />
        <Portrait />
        <About />
        <Experience />
        <Projects />
      </main>
      <Footer />
    </>
  );
}
