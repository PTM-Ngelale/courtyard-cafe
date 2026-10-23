/**
 * The menu. Food is transcribed from the cafe's updated printed menu
 * (October 2026); drinks from the earlier menu boards.
 * Prices are Nigerian naira, shown without a currency symbol (the section
 * subline states "Prices in naira").
 *
 * Shapes:
 *   MenuItem  { n: name, d?: description, p: price, mark? }
 *   MenuGroup { title, note?, items: MenuItem[] }
 *
 * `mark` mirrors the printed menu's symbols: favourite ★ · lighter 🌿 · spicy 🌶
 */

export type MenuMark = 'favourite' | 'lighter' | 'spicy';

export interface MenuItem {
  n: string;
  d?: string;
  p: string;
  mark?: MenuMark;
}

export interface MenuGroup {
  title: string;
  note?: string;
  items: MenuItem[];
}

export const foodGroups: MenuGroup[] = [
  {
    title: 'All-day breakfast',
    items: [
      {
        n: 'Full English Breakfast',
        d: 'Toast, eggs cooked your way, grilled tomatoes, crispy bacon, sautéed mushrooms and baked beans',
        p: '15,000',
        mark: 'favourite',
      },
      {
        n: 'Pancake Breakfast',
        d: 'Fluffy buttermilk pancakes served with eggs cooked your way, sausages, baked beans and crispy bacon',
        p: '16,000',
      },
      {
        n: 'Oatmeal Pancakes',
        d: 'Wholesome oatmeal pancakes served with scrambled or sunny-side-up eggs',
        p: '8,800',
        mark: 'lighter',
      },
      {
        n: 'Courtyard Special',
        d: 'Golden French toast served with eggs, sautéed mushrooms and sausages, topped with whipped cream',
        p: '16,000',
        mark: 'favourite',
      },
      {
        n: 'Buttermilk Pancakes',
        d: 'Fluffy buttermilk pancakes served with scrambled eggs and maple syrup',
        p: '6,800',
      },
      {
        n: 'Blueberry Pancakes',
        d: 'Fluffy pancakes with juicy blueberries, finished with maple syrup. Served with scrambled or sunny-side-up eggs',
        p: '8,000',
      },
      {
        n: 'Buttermilk Waffles',
        d: 'Golden, crisp-edged waffles with a soft centre, served with maple syrup',
        p: '7,000',
      },
      {
        n: 'Avocado & Egg Toast',
        d: 'Toasted bread topped with creamy avocado and sunny-side-up eggs',
        p: '7,500',
        mark: 'lighter',
      },
      {
        n: 'African Breakfast',
        d: 'Freshly prepared akara served with bread, creamy custard and milk',
        p: '7,000',
      },
    ],
  },
  {
    title: 'Breakfast add-ons',
    items: [
      { n: 'Extra Egg', p: '1,000' },
      { n: 'Bacon', d: '3 pcs', p: '2,000' },
      { n: 'Sausage', d: '2 pcs', p: '2,000' },
      { n: 'Avocado', p: '2,500' },
      { n: 'Mushrooms', p: '1,500' },
      { n: 'Cheese', p: '1,500' },
      { n: 'Maple Syrup', p: '1,000' },
    ],
  },
  {
    title: 'Burgers & sandwiches',
    items: [
      {
        n: 'Citizens Burger',
        d: 'Juicy beef patty, tomatoes, caramelised onions, cheese, lettuce and our signature sauce',
        p: '14,000',
        mark: 'favourite',
      },
      {
        n: 'Classic Beef Burger',
        d: 'Juicy beef patty with fresh lettuce, tomatoes, onions and house sauce',
        p: '10,500',
      },
      {
        n: 'Club Sandwich',
        d: 'Grilled chicken, egg, lettuce, tomatoes and creamy dressing',
        p: '10,500',
      },
      {
        n: 'Tuna Sandwich',
        d: 'Tuna with tomatoes, lettuce and creamy dressing',
        p: '8,500',
      },
    ],
  },
  {
    title: 'Rice & local favourites',
    items: [
      {
        n: 'Smoky Jollof Rice',
        d: 'Firewood-style jollof rice with a side of plantain or coleslaw',
        p: '6,500',
      },
      {
        n: 'Asun Fried Rice',
        d: 'Fried rice with mixed vegetables and spicy diced goat meat',
        p: '10,000',
        mark: 'spicy',
      },
      {
        n: 'Special Fried Rice',
        d: 'Fried rice with eggs, sausages, shrimp, vegetables and chicken',
        p: '12,000',
        mark: 'favourite',
      },
      {
        n: 'Caribbean Rice',
        d: "Chef's special rice with vegetables, diced plantain and chicken",
        p: '10,500',
      },
      {
        n: 'Chicken Oriental Sauce & Rice',
        d: 'Chicken in rich Oriental-style sauce, served with steamed white rice',
        p: '14,000',
      },
      {
        n: 'Cabbage Rice Stir-Fry',
        d: 'Shredded cabbage stir-fried with mixed protein and veggies',
        p: '8,500',
        mark: 'lighter',
      },
    ],
  },
  {
    title: 'Noodles & pasta',
    items: [
      {
        n: 'Chicken Noodles',
        d: 'Stir-fried noodles with diced chicken and vegetables',
        p: '5,950',
      },
      {
        n: 'Spicy Beef Noodles',
        d: 'Stir-fried noodles with tender beef, vegetables in a spicy sauce',
        p: '6,200',
        mark: 'spicy',
      },
      {
        n: 'Courtyard Special Noodles',
        d: 'Our signature stir-fried noodles with a delicious mix of protein and vegetables',
        p: '7,000',
        mark: 'favourite',
      },
      {
        n: 'Beef Penne Pasta',
        d: 'Penne pasta with diced beef and bell peppers',
        p: '15,000',
      },
      {
        n: 'Chicken Alfredo Pasta',
        d: 'Creamy Alfredo pasta with diced chicken',
        p: '16,000',
      },
      {
        n: 'Spaghetti Bolognese',
        d: 'Spaghetti in a rich beef and tomato sauce',
        p: '13,000',
      },
    ],
  },
  {
    title: 'Signature mains',
    items: [
      {
        n: 'Steak & Baked Potatoes',
        d: 'Tender steak with baked potatoes and your choice of rich gravy or creamy mushroom sauce',
        p: '17,500',
      },
      {
        n: 'Yamarita',
        d: 'Golden, crispy yam slices served with egg sauce',
        p: '9,000',
      },
      {
        n: 'Taco Bites',
        d: 'Crispy taco bites filled with seasoned protein and fresh toppings',
        p: '13,000',
      },
      {
        n: 'Goat Meat Pepper Soup',
        d: 'Tender goat meat in a rich, aromatic broth',
        p: '6,500',
        mark: 'spicy',
      },
      {
        n: 'Chicken Pepper Soup',
        d: 'Tender chicken in a fragrant, warming broth',
        p: '6,000',
        mark: 'spicy',
      },
    ],
  },
  {
    title: 'Sharing platters',
    items: [
      {
        n: 'Courtyard Platter',
        d: 'Spring rolls, samosas, gizzard kebab, chicken kebab, grilled beef kebab, peppered goat meat and French fries, plus a choice of yam fries or sweet potato fries',
        p: '25,000',
        mark: 'favourite',
      },
      {
        n: 'Full Courtyard Platter',
        d: 'A larger sharing feast with spring rolls, samosas, gizzard kebab, chicken kebab, grilled beef kebab, peppered goat meat, 3 chicken wings and a double portion of French fries, plus yam fries or sweet potato fries',
        p: '35,000',
      },
    ],
  },
  {
    title: 'Salads',
    items: [
      {
        n: 'Avocado Chicken Salad',
        d: 'Lettuce, avocado, eggs, tomatoes, grilled chicken and cucumber',
        p: '10,500',
        mark: 'lighter',
      },
      {
        n: 'Chicken Salad',
        d: 'Chicken, lettuce, tomatoes, boiled egg, cucumber and sweet corn',
        p: '12,000',
      },
      {
        n: "Chef's Special Salad",
        d: 'Avocado, tomatoes, chicken, sweet corn, lettuce, shrimp and cucumber',
        p: '16,000',
        mark: 'favourite',
      },
    ],
  },
  {
    title: 'Proteins & extras',
    note: 'Wing flavours — original, peppered, honey-glazed or buffalo',
    items: [
      { n: 'Chicken Wings', d: 'Regular pack, 5 pcs', p: '7,300' },
      { n: 'Chicken Wings', d: 'Pro pack, 10 pcs', p: '12,800' },
      { n: 'Grilled Chicken', p: '6,000' },
      { n: 'Chicken Drumsticks', p: '9,000' },
      { n: 'Asun', p: '5,800', mark: 'spicy' },
      { n: 'Peppered Goat Meat', p: '6,500', mark: 'spicy' },
      { n: 'Peppered Prawns', p: '14,000', mark: 'spicy' },
      { n: 'Peppered Snails', p: '9,000', mark: 'spicy' },
    ],
  },
  {
    title: 'Sides',
    items: [
      { n: 'French Fries', p: '3,000' },
      { n: 'Sweet Potato Fries', p: '3,000' },
      { n: 'Yam Fries', p: '3,000' },
      { n: 'Steamed White Rice', p: '2,500' },
      { n: 'Nigerian Fried Rice', p: '4,000' },
    ],
  },
  {
    title: 'Freshly baked',
    items: [
      { n: 'Blueberry Muffin', p: '900' },
      { n: 'Blueberry Dream Muffin', p: '1,500' },
      { n: 'Cocoa Muffin', p: '900' },
      { n: 'Cocoa Dream Muffin', p: '1,500' },
      { n: 'Banana Muffin', p: '900' },
      { n: 'Banana Dream Muffin', p: '1,500' },
      { n: 'Meat Pie', p: '1,200' },
      { n: 'Chicken Pie', p: '1,000' },
      { n: 'Butter Croissant', p: '3,200' },
      { n: 'Pain au Chocolat', p: '2,500' },
      { n: 'Danish Pastry', p: '2,000' },
    ],
  },
];

export const drinkGroups: MenuGroup[] = [
  {
    title: 'Cocktails',
    items: [
      { n: 'Long Island', p: '8,500' },
      { n: 'Margarita', p: '8,500' },
      { n: 'Chapman', p: '7,500' },
      { n: 'Screwdriver', p: '8,500' },
      { n: 'Mojito', p: '8,500' },
      { n: 'Tequila Sunrise', p: '8,500' },
    ],
  },
  {
    title: 'Mocktails',
    items: [
      { n: 'Chapman', p: '7,000' },
      { n: 'Tropical Sunset', p: '7,000' },
      { n: 'Passion Delight', p: '7,000' },
      { n: 'Lemonade', p: '6,500' },
    ],
  },
  {
    title: 'Hot drinks',
    items: [
      { n: 'Cappuccino', p: '3,000' },
      { n: 'Espresso', p: '2,500' },
      { n: 'Americano', p: '3,000' },
      { n: 'Latte', p: '3,000' },
      { n: 'Hot Chocolate', p: '3,500' },
    ],
  },
  {
    title: 'Cold drinks',
    items: [
      { n: 'Caramel Frappuccino', p: '7,000' },
      { n: 'Iced Latte', p: '6,000' },
      { n: 'Iced Matcha Latte', p: '6,500' },
    ],
  },
  {
    title: 'Milkshakes',
    items: [
      { n: 'Vanilla', p: '6,800' },
      { n: 'Strawberry', p: '6,800' },
      { n: 'Oreo', p: '7,500' },
    ],
  },
  {
    title: 'Others',
    items: [
      { n: 'Soda', p: '1,000' },
      { n: 'Energy drinks', p: '1,700' },
      { n: 'Beer', p: '2,000' },
      { n: 'Water', p: '1,000' },
      { n: 'Four Cousins wine', p: '18,000' },
    ],
  },
];

/**
 * How the food menu is split into tabs on the site, by group title, in display
 * order. Any group not listed here still shows, at the end of the last tab.
 */
export const foodSections: { id: string; label: string; groups: string[] }[] = [
  { id: 'breakfast', label: 'Breakfast', groups: ['All-day breakfast', 'Breakfast add-ons', 'Freshly baked'] },
  { id: 'mains', label: 'Mains', groups: ['Rice & local favourites', 'Noodles & pasta', 'Signature mains', 'Burgers & sandwiches'] },
  { id: 'platters', label: 'Platters & salads', groups: ['Sharing platters', 'Salads'] },
  { id: 'extras', label: 'Sides & extras', groups: ['Proteins & extras', 'Sides'] },
];

/** Drinks in serving order: coffee from the moment we open, cocktails from noon. */
export const drinkOrder = ['Hot drinks', 'Cold drinks', 'Milkshakes', 'Mocktails', 'Cocktails', 'Others'];
