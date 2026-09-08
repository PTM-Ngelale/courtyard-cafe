/**
 * The menu — transcribed verbatim from the cafe's printed menu boards.
 * Prices are Nigerian naira, shown without a currency symbol (the section
 * subline states "Prices in naira").
 *
 * Shapes:
 *   MenuItem  { n: name, d?: description, p: price }
 *   MenuGroup { title, note?, items: MenuItem[] }
 */

export interface MenuItem {
  n: string;
  d?: string;
  p: string;
}

export interface MenuGroup {
  title: string;
  note?: string;
  items: MenuItem[];
}

export const foodGroups: MenuGroup[] = [
  {
    title: 'Breakfast',
    note: 'Egg choices — scrambled, omelette, sunny side, boiled',
    items: [
      {
        n: 'English Breakfast',
        d: 'Toast, eggs of choice, bacon, grilled tomatoes, mushroom, baked beans',
        p: '14,000',
      },
      {
        n: 'Courtyard Special',
        d: 'French toast, eggs, mushroom, sausages, whipped cream and berries',
        p: '15,500',
      },
      {
        n: 'African Breakfast',
        d: 'Akara, custard, toasted bread served with milk',
        p: '7,000',
      },
      { n: 'Buttermilk Pancakes', d: 'With maple syrup', p: '6,000' },
      { n: 'Blueberry Pancakes', d: 'Blueberry glaze and syrup', p: '7,500' },
      { n: 'Buttermilk Waffles', d: 'With maple syrup', p: '7,000' },
      {
        n: 'Avocado Toast',
        d: 'Toasted bread, avocado, sunny side up eggs',
        p: '7,500',
      },
    ],
  },
  {
    title: 'Lunch',
    items: [
      {
        n: 'Dirty Jollof',
        d: 'Nigerian-style jollof with diced chicken, beef, vegetables and fried plantain',
        p: '13,000',
      },
      {
        n: 'Asun Fried Rice',
        d: 'Spicy fried rice with goat meat, vegetables and egg',
        p: '12,000',
      },
      { n: 'Yamarita', d: 'Fried coated yam served with egg sauce', p: '9,000' },
      {
        n: 'Beef Burger',
        d: 'Beef patty, tomatoes, caramelised onions, cheese, lettuce, fries',
        p: '10,500',
      },
      {
        n: 'Citizens Burger',
        d: 'Beef patty, bacon, caramelised onions, cheese, sausage, egg, fries',
        p: '12,000',
      },
      {
        n: 'Club Sandwich',
        d: 'Grilled chicken, tomatoes, egg, lettuce and cream',
        p: '7,000',
      },
      { n: 'Tuna Sandwich', d: 'Tuna, tomatoes, lettuce, cream', p: '5,700' },
      {
        n: 'Beef Penne Pasta',
        d: 'Rich beef bolognese with vegetables',
        p: '14,000',
      },
      {
        n: 'Alfredo Penne Pasta',
        d: 'Creamy chicken alfredo sauce',
        p: '16,000',
      },
      {
        n: 'Chicken Noodles',
        d: 'Stir fry with green pepper, onions, grilled chicken',
        p: '5,800',
      },
      {
        n: 'Spicy Noodles',
        d: 'Stir fry with extra pepper and spicy beef',
        p: '6,200',
      },
      {
        n: 'Special Noodles',
        d: 'Beef, chicken, vegetables and choice of egg',
        p: '7,000',
      },
      {
        n: 'The Platter',
        d: 'Spring roll, samosa, gizzard, fries, wings (5 pcs) and chicken',
        p: '19,000',
      },
      { n: 'Goat Meat Pepper Soup', p: '6,500' },
      { n: 'Chicken Pepper Soup', p: '6,000' },
    ],
  },
  {
    title: 'Salads',
    items: [
      {
        n: 'Chicken Salad',
        d: 'Lettuce, sweet corn, cucumber, cherry tomatoes, grilled chicken',
        p: '10,500',
      },
      {
        n: 'Caesar Salad',
        d: 'Lettuce, grilled chicken, croutons, caesar dressing, parmesan',
        p: '10,000',
      },
      {
        n: 'Avocado Salad',
        d: 'Sweet corn, avocado, cucumber, cherry tomatoes, grilled prawns',
        p: '15,000',
      },
    ],
  },
  {
    title: 'Protein & wings',
    note: 'Wing flavours — original, BBQ, honey garlic',
    items: [
      { n: 'Chicken Wings', d: 'Regular pack, 5 pcs', p: '7,000' },
      { n: 'Chicken Wings', d: 'Pro pack, 10 pcs', p: '12,000' },
      { n: 'Peppered Drumsticks', p: '6,500' },
      { n: 'Grilled Croaker', p: '9,500' },
      { n: 'Gizzard with Potato Fries', p: '19,000' },
    ],
  },
  {
    title: 'Pastries',
    items: [
      { n: 'Meat Pie', p: '1,200' },
      { n: 'Chicken Pie', p: '1,000' },
      { n: 'Blueberry Muffins', p: '900' },
      { n: 'Coco Muffins', p: '900' },
    ],
  },
  {
    title: 'Sides',
    items: [
      { n: 'French Fries', p: '3,000' },
      { n: 'Potato Fries', p: '3,000' },
      { n: 'Yam Fries', p: '3,000' },
      { n: 'White Rice', p: '2,500' },
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
