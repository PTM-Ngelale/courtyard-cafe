import type { MenuGroup as MenuGroupData } from '@/data/menu';

/** One drinks category as a card: heading, then name · dotted leader · price. */
export function DrinkCard({ group }: { group: MenuGroupData }) {
  return (
    <div className="drink-card">
      <h4>{group.title}</h4>
      <dl className="drink-card__list">
        {group.items.map((item, i) => (
          <div className="drink-row" key={`${item.n}-${i}`}>
            <dt className="drink-row__name">{item.n}</dt>
            <span className="drink-row__leader" aria-hidden="true" />
            <dd className="drink-row__price">{item.p}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
