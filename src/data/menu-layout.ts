/**
 * How the menu data is arranged on the site: food into tabs, drinks in
 * serving order, and the dishes the home page previews. Shared by the home
 * page and /menu so both always show the same prices.
 */
import type { MenuSection } from '@/components/MenuTabs';
import { drinkGroups, drinkOrder, foodGroups, foodSections, type MenuItem } from './menu';

// Food groups arranged into the site's tabs; anything unassigned joins the last tab so no dish disappears.
export const MENU_SECTIONS: MenuSection[] = (() => {
  const byTitle = new Map(foodGroups.map((g) => [g.title, g]));
  const sections = foodSections.map((s) => ({
    id: s.id,
    label: s.label,
    groups: s.groups.flatMap((t) => {
      const g = byTitle.get(t);
      byTitle.delete(t);
      return g ? [g] : [];
    }),
  }));
  sections[sections.length - 1].groups.push(...byTitle.values());
  return sections;
})();

export const DRINKS = [...drinkGroups].sort(
  (a, b) => (drinkOrder.indexOf(a.title) + 1 || 99) - (drinkOrder.indexOf(b.title) + 1 || 99),
);

type PhotoName = 'breakfast' | 'wings' | 'springrolls' | 'milkshake';

export interface Favourite {
  photo: PhotoName;
  alt: string;
  name: string;
  blurb: string;
  /** Naira, as written on the menu ("15,000"). */
  price: string;
  /** The dish comes in sizes; `price` is the smallest. */
  from?: boolean;
}

/** Finds a dish by group and name, so preview prices come from the menu itself. */
function dish(groupTitle: string, name: string, desc?: string): MenuItem {
  const group = [...foodGroups, ...drinkGroups].find((g) => g.title === groupTitle);
  const item = group?.items.find((i) => i.n === name && (desc === undefined || i.d === desc));
  if (!item) throw new Error(`Home-page favourite not on the menu: ${groupTitle} / ${name}`);
  return item;
}

/** The home page's preview: dishes we have real photos of. */
export const FAVOURITES: Favourite[] = [
  {
    photo: 'breakfast',
    alt: 'Full English breakfast',
    name: 'Full English Breakfast',
    blurb: 'Eggs your way, bacon, mushrooms, beans and toast. Served all day.',
    price: dish('All-day breakfast', 'Full English Breakfast').p,
  },
  {
    photo: 'wings',
    alt: 'Honey-glazed chicken wings',
    name: 'Chicken Wings',
    blurb: 'Original, peppered, honey-glazed or buffalo. 5 or 10 pieces.',
    price: dish('Proteins & extras', 'Chicken Wings', 'Regular pack, 5 pcs').p,
    from: true,
  },
  {
    photo: 'springrolls',
    alt: 'Spring rolls and samosas with pepper dip',
    name: 'Courtyard Platter',
    blurb: 'Spring rolls, samosas, kebabs, peppered goat meat and fries. Made for sharing.',
    price: dish('Sharing platters', 'Courtyard Platter').p,
  },
  {
    photo: 'milkshake',
    alt: 'Strawberry milkshake',
    name: 'Strawberry Milkshake',
    blurb: 'Thick and cold, in a tall glass.',
    price: dish('Milkshakes', 'Strawberry').p,
  },
];
