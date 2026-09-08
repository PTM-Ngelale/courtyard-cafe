import type { MenuGroup as MenuGroupData } from '@/data/menu';

/** One food category: heading + fading rule, then name/description/price rows. */
export function MenuGroup({ group }: { group: MenuGroupData }) {
  return (
    <div className="menu-group">
      <div className="menu-group__head">
        <h3>{group.title}</h3>
        <span className="menu-group__rule" aria-hidden="true" />
      </div>

      <dl className="menu-group__list">
        {group.items.map((item, i) => (
          <div className="menu-row" key={`${item.n}-${i}`}>
            <div className="menu-row__main">
              <dt className="menu-row__name">{item.n}</dt>
              {item.d && <dd className="menu-row__desc">{item.d}</dd>}
            </div>
            <div className="menu-row__price">{item.p}</div>
          </div>
        ))}
      </dl>

      {group.note && <p className="menu-group__note">{group.note}</p>}
    </div>
  );
}
