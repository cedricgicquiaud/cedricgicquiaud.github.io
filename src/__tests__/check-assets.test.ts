import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAssets } from "../../scripts/check-assets.mjs";

const root = path.resolve(__dirname, "../..");
const script = path.join(root, "scripts", "check-assets.mjs");

/** Une fiche factice minimale ; `front` : lignes YAML ajoutées au frontmatter. */
const fiche = (front = "") => `---
nom: Alpha
statut: en cours
visibilite: public
${front}---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` et un `public/` vide ; `file` y écrit un fichier sous public/
 * (`size` : taille finale, complétée d'octets nuls par `truncate` pour ne pas allouer un gros tampon). */
function sandbox(front = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "assets-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), fiche(front));
  const file = (rel: string, content: Buffer, size?: number) => {
    const full = path.join(pub, "." + rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
    if (size !== undefined) truncateSync(full, size);
  };
  return { fiches, pub, file };
}

/** Un PNG minimal : signature + chunk IHDR (largeur, hauteur), complété d'octets nuls jusqu'à `size`. */
function png(width: number, height: number, size = 64) {
  const buf = Buffer.alloc(size);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

describe("checkAssets — existence des fichiers déclarés (PFO-60)", () => {
  it("ne rend aucun problème pour une fiche qui ne déclare aucun fichier", () => {
    const { fiches, pub } = sandbox();
    expect(checkAssets(fiches, pub)).toEqual([]);
  });

  it("ne rend aucun problème quand le visuel déclaré existe dans public/", () => {
    const { fiches, pub, file } = sandbox("visuel: /projets/alpha/visuel.png\n");
    file("/projets/alpha/visuel.png", png(1200, 750));
    expect(checkAssets(fiches, pub)).toEqual([]);
  });

  it("signale un visuel absent en nommant la fiche et le chemin", () => {
    const { fiches, pub } = sandbox("visuel: /projets/alpha/absent.png\n");
    const problems = checkAssets(fiches, pub);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^alpha\.md : visuel « \/projets\/alpha\/absent\.png » : absent de public\//);
  });

  it("signale une capture et une vidéo absentes en nommant la fiche, le champ et le chemin", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500));
    const problems = checkAssets(fiches, pub);
    expect(problems).toEqual([
      "alpha.md : captures, entrée 2 « /projets/alpha/b.png » : absent de public/",
      "alpha.md : video « /projets/alpha/demo.mp4 » : absent de public/",
    ]);
  });
});

type WebpChunk = "VP8X" | "VP8 " | "VP8L";

/** Un WebP minimal : « RIFF » + taille + « WEBP », puis le premier chunk qui porte les dimensions :
 * VP8X (étendu : largeur - 1 et hauteur - 1 sur 3 octets), VP8 (avec perte : code de début 9D 01 2A puis
 * largeur et hauteur sur 14 bits) ou VP8L (sans perte : octet 2F puis largeur - 1 et hauteur - 1 sur 14 bits). */
function webp(width: number, height: number, size = 64, chunk: WebpChunk = "VP8X") {
  const buf = Buffer.alloc(size);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(size - 8, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write(chunk, 12, "ascii");
  buf.writeUInt32LE(size - 20, 16);
  if (chunk === "VP8X") {
    buf.writeUIntLE(width - 1, 24, 3);
    buf.writeUIntLE(height - 1, 27, 3);
  } else if (chunk === "VP8 ") {
    Buffer.from([0x9d, 0x01, 0x2a]).copy(buf, 23);
    buf.writeUInt16LE(width, 26);
    buf.writeUInt16LE(height, 28);
  } else {
    buf[20] = 0x2f;
    buf.writeUInt32LE((width - 1) | ((height - 1) << 14), 21);
  }
  return buf;
}

/** Les trois premiers octets d'un JPEG, complétés d'octets nuls. */
const jpeg = (size = 64) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(size - 3)]);

/** Un MP4 minimal : taille de boîte puis « ftyp » à l'offset 4. */
function mp4(size = 32) {
  const buf = Buffer.alloc(size);
  buf.writeUInt32BE(size, 0);
  buf.write("ftyp", 4, "ascii");
  return buf;
}

const KO = 1024;
const MO = 1024 * KO;

describe("checkAssets — poids des fichiers déclarés (PFO-60)", () => {
  it("accepte une capture de 300 Ko juste et refuse une capture de 300 Ko + 1 octet en donnant le poids", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500, 300 * KO));
    file("/projets/alpha/b.png", png(800, 500, 300 * KO + 1));
    expect(checkAssets(fiches, pub)).toEqual([
      "alpha.md : captures, entrée 2 « /projets/alpha/b.png » : 307201 octets, plafond 300 Ko (307200 octets)",
    ]);
  });

  it("accepte une vidéo de 15 Mo juste et refuse une vidéo de 15 Mo + 1 octet en donnant le poids", () => {
    const front = `video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;
    const ok = sandbox(front);
    ok.file("/projets/alpha/demo.mp4", mp4(), 15 * MO);
    expect(checkAssets(ok.fiches, ok.pub)).toEqual([]);
    const heavy = sandbox(front);
    heavy.file("/projets/alpha/demo.mp4", mp4(), 15 * MO + 1);
    expect(checkAssets(heavy.fiches, heavy.pub)).toEqual([
      "alpha.md : video « /projets/alpha/demo.mp4 » : 15728641 octets, plafond 15 Mo (15728640 octets)",
    ]);
  });
});

describe("checkAssets — type reconnu par le contenu (PFO-61)", () => {
  it("accepte un PNG et un WebP comme captures et refuse un JPEG renommé .png en nommant la fiche et le chemin", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.webp
    legende: Le rapport
  - fichier: /projets/alpha/c.png
    legende: Une photo
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500));
    file("/projets/alpha/b.webp", webp(800, 500));
    file("/projets/alpha/c.png", jpeg());
    expect(checkAssets(fiches, pub)).toEqual([
      "alpha.md : captures, entrée 3 « /projets/alpha/c.png » : ni PNG ni WebP d'après son contenu",
    ]);
  });

  it("accepte un MP4 comme vidéo et refuse un fichier sans « ftyp » en nommant la fiche et le chemin", () => {
    const front = `video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;
    const ok = sandbox(front);
    ok.file("/projets/alpha/demo.mp4", mp4());
    expect(checkAssets(ok.fiches, ok.pub)).toEqual([]);
    const fake = sandbox(front);
    fake.file("/projets/alpha/demo.mp4", png(1200, 750));
    expect(checkAssets(fake.fiches, fake.pub)).toEqual([
      "alpha.md : video « /projets/alpha/demo.mp4 » : pas un MP4 d'après son contenu (« ftyp » absent)",
    ]);
  });
});

describe("checkAssets — dimensions de la capture principale (PFO-61)", () => {
  it.each([
    [1200, 630],
    [800, 500],
  ])("refuse un visuel PNG de %i×%i en donnant les dimensions lues", (width, height) => {
    const { fiches, pub, file } = sandbox("visuel: /projets/alpha/visuel.png\n");
    file("/projets/alpha/visuel.png", png(width, height));
    expect(checkAssets(fiches, pub)).toEqual([
      `alpha.md : visuel « /projets/alpha/visuel.png » : ${width}×${height}, attendu 1200×750`,
    ]);
  });

  it.each<WebpChunk>(["VP8X", "VP8 ", "VP8L"])("lit les dimensions d'un visuel WebP dans le chunk %s : 1200×750 passe, 1200×630 est refusé", (chunk) => {
    const ok = sandbox("visuel: /projets/alpha/visuel.webp\n");
    ok.file("/projets/alpha/visuel.webp", webp(1200, 750, 64, chunk));
    expect(checkAssets(ok.fiches, ok.pub)).toEqual([]);
    const wrong = sandbox("visuel: /projets/alpha/visuel.webp\n");
    wrong.file("/projets/alpha/visuel.webp", webp(1200, 630, 64, chunk));
    expect(checkAssets(wrong.fiches, wrong.pub)).toEqual([
      "alpha.md : visuel « /projets/alpha/visuel.webp » : 1200×630, attendu 1200×750",
    ]);
  });

  it.each([
    ["un PNG tronqué avant IHDR", png(1200, 750).subarray(0, 10)],
    ["un WebP dont le premier chunk est inconnu", webp(1200, 750, 64, "ALPH" as WebpChunk)],
  ])("signale des dimensions illisibles pour %s au lieu de planter", (_, content) => {
    const { fiches, pub, file } = sandbox("visuel: /projets/alpha/visuel.png\n");
    file("/projets/alpha/visuel.png", Buffer.from(content));
    expect(checkAssets(fiches, pub)).toEqual([
      "alpha.md : visuel « /projets/alpha/visuel.png » : dimensions illisibles dans l'en-tête, attendu 1200×750",
    ]);
  });

  it("accepte une capture de galerie de dimensions quelconques (800×500)", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500));
    expect(checkAssets(fiches, pub)).toEqual([]);
  });
});

describe("scripts/check-assets.mjs en ligne de commande (PFO-60)", () => {
  it("sort en erreur avec la liste des problèmes quand un fichier déclaré manque, en succès sinon", () => {
    const bad = sandbox("visuel: /projets/alpha/absent.png\n");
    expect(() => execFileSync("node", [script, bad.fiches, bad.pub], { cwd: root, stdio: "pipe" })).toThrow(
      /alpha\.md : visuel « \/projets\/alpha\/absent\.png » : absent de public\//,
    );
    const good = sandbox("visuel: /projets/alpha/visuel.png\n");
    good.file("/projets/alpha/visuel.png", png(1200, 750));
    const stdout = execFileSync("node", [script, good.fiches, good.pub], { cwd: root, stdio: "pipe" });
    expect(String(stdout)).toContain("check-assets : ");
  });
});
