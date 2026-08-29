import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Intro } from "@/components/intro";
import { Nav } from "@/components/nav";
import { Portrait } from "@/components/portrait";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <>
      <Nav />
      <ThemeToggle />
      <main className="flex flex-1 flex-col">
        <Intro />
        <Portrait />
        <About />
        <Experience />
      </main>
      <Footer />
    </>
  );
}
