export const PROJECT_STAGES = [
  'idea',
  'scenario',
  'snippet',
  'in_production',
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const MEDIA_SNIPPET_TYPES = ['video', 'image', 'link'] as const;

export type MediaSnippetType = (typeof MEDIA_SNIPPET_TYPES)[number];

export const ROLE_BADGE_COLORS: Record<string, string> = {
  director: 'border-purple-500/40 bg-purple-950/40 text-purple-200',
  actor: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
  screenwriter: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
  cinematographer: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-200',
  editor: 'border-blue-500/40 bg-blue-950/40 text-blue-200',
  sound_designer: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
  composer: 'border-pink-500/40 bg-pink-950/40 text-pink-200',
  producer: 'border-orange-500/40 bg-orange-950/40 text-orange-200',
  costume_designer: 'border-fuchsia-500/40 bg-fuchsia-950/40 text-fuchsia-200',
  makeup_artist: 'border-lime-500/40 bg-lime-950/40 text-lime-200',
};

export const STAGE_COLORS: Record<string, string> = {
  idea: 'text-zinc-300',
  scenario: 'text-amber-300',
  snippet: 'text-cyan-300',
  in_production: 'text-emerald-300',
};
