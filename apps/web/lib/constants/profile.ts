export const CREATIVE_ROLES = [
  'director',
  'actor',
  'screenwriter',
  'cinematographer',
  'editor',
  'sound_designer',
  'composer',
  'producer',
  'costume_designer',
  'makeup_artist',
] as const;

export const GENRE_TAGS = [
  'thriller',
  'drama',
  'comedy',
  'horror',
  'sci_fi',
  'documentary',
  'action',
  'romance',
  'fantasy',
  'animation',
] as const;

export type CreativeRole = (typeof CREATIVE_ROLES)[number];
export type GenreTag = (typeof GENRE_TAGS)[number];

export function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
