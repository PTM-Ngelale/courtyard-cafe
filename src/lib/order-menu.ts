import { drinkGroups, drinkOrder, foodGroups, foodSections, type MenuGroup } from '@/data/menu';

/**
 * The menu as something you can order from. Built from `src/data/menu.ts`, so
 * the site menu and the delivery prices can never drift apart.
 *
 * Item names repeat across groups ("Chapman" is both a cocktail and a
 * mocktail), so an item's id is its group and name together.
 */

export interface OrderItem {
  id: string;
  name: string;
  group: string;
  description?: string;
  priceNaira: number;
}

export interface OrderGroup {
  title: string;
  items: OrderItem[];
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toNaira = (p: string) => Number(p.replace(/,/g, ''));

function toOrderGroup(g: MenuGroup): OrderGroup {
  return {
    title: g.title,
    items: g.items.map((item) => ({
      id: `${slug(g.title)}/${slug(item.n)}`,
      name: item.n,
      group: g.title,
      description: item.d,
      priceNaira: toNaira(item.p),
    })),
  };
}

function inOrder(groups: MenuGroup[], titles: string[]) {
  const rank = (t: string) => {
    const i = titles.indexOf(t);
    return i === -1 ? titles.length : i;
  };
  return [...groups].sort((a, b) => rank(a.title) - rank(b.title));
}

/** Food then drinks, in the same order the site shows them. */
export const orderGroups: OrderGroup[] = [
  ...inOrder(foodGroups, foodSections.flatMap((s) => s.groups)),
  ...inOrder(drinkGroups, drinkOrder),
].map(toOrderGroup);

export const orderItemsById = new Map(
  orderGroups.flatMap((g) => g.items).map((item) => [item.id, item]),
);

/** Most of one item a single order may hold. */
export const MAX_QUANTITY = 20;

export const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
