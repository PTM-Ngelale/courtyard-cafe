import type { MenuGroup as MenuGroupData, MenuMark as MenuMarkKind } from '@/data/menu';

export const MARK_LABELS: Record<MenuMarkKind, string> = {
  favourite: 'Courtyard favourite',
  lighter: 'Lighter choice',
  spicy: 'Spicy',
};

/** The printed menu's symbols: gold star, green leaf, red chili. */
export function MenuMark({ mark }: { mark: MenuMarkKind }) {
  return (
    <svg
      className={`menu-mark menu-mark--${mark}`}
      viewBox="0 0 16 16"
      width="13"
      height="13"
      role="img"
      aria-label={MARK_LABELS[mark]}
    >
      {mark === 'favourite' && (
        <path d="M8 1.2l2 4.3 4.7.5-3.5 3.2 1 4.6L8 11.5l-4.2 2.3 1-4.6L1.3 6l4.7-.5z" fill="currentColor" />
      )}
      {mark === 'lighter' && (
        <>
          <path d="M2.5 13.5C2.5 6.5 7 2.5 14 2.5c0 7-4 11-11.5 11z" fill="currentColor" />
          <path d="M3 13l6.5-6.5" stroke="var(--surface)" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
      {mark === 'spicy' && (
        <>
          <path d="M4.2 5.2c3.6-.4 8.2 1.6 9.3 8.6C9.4 12.6 4.3 10 4.2 5.2z" fill="currentColor" />
          <path d="M4.6 5.3C4.4 3.6 5.4 2.4 7 2.2" stroke="#4f7a52" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

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
              <dt className="menu-row__name">
                {item.n}
                {item.mark && <MenuMark mark={item.mark} />}
              </dt>
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
