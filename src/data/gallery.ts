import type { PhotoName } from '@/components/Photo';

export interface GalleryPhoto {
  name: PhotoName;
  alt: string;
  caption: string;
}

/**
 * Photos on /gallery, in order. To add one: put the original in
 * src/assets/img/, add its name to PhotoName in components/Photo.tsx, run
 * `npm run images`, then list it here.
 */
export const GALLERY: GalleryPhoto[] = [
  { name: 'pasta', alt: 'Asun pasta', caption: 'Asun pasta' },
  { name: 'breakfast', alt: 'Full English breakfast', caption: 'Full English, served all day' },
  { name: 'wings', alt: 'Honey-glazed chicken wings', caption: 'Honey-glazed wings' },
  { name: 'springrolls', alt: 'Spring rolls and samosas with pepper dip', caption: 'Spring rolls, samosas and pepper dip' },
  { name: 'milkshake', alt: 'Strawberry milkshake', caption: 'Strawberry milkshake' },
];

/** The three the home page shows before "See the gallery". */
export const GALLERY_PREVIEW = GALLERY.slice(0, 3);
