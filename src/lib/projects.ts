export interface ProjectText {
  title: string;
  caption: string;
  overview: string;
  role: string;
  shotCaptions: string[];
}

export interface Project {
  slug: string;
  order: number;
  year: number;
  example: boolean;
  tags: string[];
  palette: [string, string, string];
  cover: string;
  shots: string[];
  video: string | null;
  link: string | null;
  pt: ProjectText;
  en: ProjectText;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function str(obj: any, key: string, file: string, ctx = ''): string {
  const value = obj?.[key];
  if (typeof value !== 'string' || !value.trim()) fail(file, `missing or empty "${ctx}${key}"`);
  return value;
}

function parseText(raw: any, locale: 'pt' | 'en', file: string, shots: number): ProjectText {
  const block = raw?.[locale];
  if (!block || typeof block !== 'object') fail(file, `missing "${locale}" block`);
  const captions = block.shotCaptions;
  if (
    !Array.isArray(captions) ||
    captions.length !== shots ||
    captions.some((c: unknown) => typeof c !== 'string' || !c.trim())
  )
    fail(file, `"${locale}.shotCaptions" must have ${shots} non-empty strings`);
  const ctx = `${locale}.`;
  return {
    title: str(block, 'title', file, ctx),
    caption: str(block, 'caption', file, ctx),
    overview: str(block, 'overview', file, ctx),
    role: str(block, 'role', file, ctx),
    shotCaptions: captions,
  };
}

export function parseProject(raw: unknown, file: string): Project {
  const r = raw as any;
  const slug = str(r, 'slug', file);
  if (!SLUG.test(slug)) fail(file, `slug "${slug}" is not URL-safe (use a-z, 0-9 and dashes)`);
  const baseName = file.split('/').pop()!.replace(/\.json$/, '');
  if (baseName !== slug) fail(file, `slug "${slug}" must match the file name "${baseName}"`);
  if (typeof r.order !== 'number') fail(file, 'missing numeric "order"');
  if (typeof r.year !== 'number') fail(file, 'missing numeric "year"');
  if (!Array.isArray(r.tags)) fail(file, 'missing "tags" array');
  if (!Array.isArray(r.palette) || r.palette.length !== 3) fail(file, '"palette" needs 3 colors');
  if (!Array.isArray(r.shots) || r.shots.length === 0) fail(file, 'missing "shots" array');
  return {
    slug,
    order: r.order,
    year: r.year,
    example: r.example === true,
    tags: r.tags,
    palette: r.palette as [string, string, string],
    cover: str(r, 'cover', file),
    shots: r.shots,
    video: typeof r.video === 'string' ? r.video : null,
    link: typeof r.link === 'string' ? r.link : null,
    pt: parseText(r, 'pt', file, r.shots.length),
    en: parseText(r, 'en', file, r.shots.length),
  };
}

export function buildProjects(entries: Record<string, unknown>): Project[] {
  const projects = Object.entries(entries).map(([file, raw]) => parseProject(raw, file));
  const seen = new Set<string>();
  for (const p of projects) {
    if (seen.has(p.slug)) throw new Error(`duplicate project slug "${p.slug}"`);
    seen.add(p.slug);
  }
  return projects.sort((a, b) => a.order - b.order);
}

export function loadProjects(): Project[] {
  const entries = import.meta.glob('../content/projects/*.json', { eager: true, import: 'default' });
  return buildProjects(entries as Record<string, unknown>);
}

export function nextProject(projects: Project[], slug: string): Project | null {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error(`unknown project slug "${slug}"`);
  if (projects.length < 2) return null;
  return projects[(index + 1) % projects.length];
}
