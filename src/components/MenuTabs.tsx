'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import type { MenuGroup as MenuGroupData } from '@/data/menu';
import { MenuGroup } from '@/components/MenuGroup';

export interface MenuSection {
  id: string;
  label: string;
  groups: MenuGroupData[];
}

/**
 * The food menu split into tabs (Breakfast, Mains, ...). Every panel is in the
 * HTML (inactive ones are `hidden`), so the whole menu stays crawlable.
 * Arrow keys, Home and End move between tabs, per the WAI-ARIA tabs pattern.
 */
export function MenuTabs({ sections }: { sections: MenuSection[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = sections.length - 1;
    const next =
      e.key === 'ArrowRight' ? (active === last ? 0 : active + 1)
      : e.key === 'ArrowLeft' ? (active === 0 ? last : active - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="menu-tabs">
      <div className="menu-tabs__list" role="tablist" aria-label="Food menu" onKeyDown={onKeyDown}>
        {sections.map((section, i) => (
          <button
            key={section.id}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`menu-tab-${section.id}`}
            aria-selected={i === active}
            aria-controls={`menu-panel-${section.id}`}
            tabIndex={i === active ? 0 : -1}
            className="menu-tabs__tab"
            onClick={() => setActive(i)}
          >
            {section.label}
            <span className="menu-tabs__count" aria-hidden="true">
              {section.groups.reduce((n, g) => n + g.items.length, 0)}
            </span>
          </button>
        ))}
      </div>

      {sections.map((section, i) => (
        <div
          key={section.id}
          role="tabpanel"
          id={`menu-panel-${section.id}`}
          aria-labelledby={`menu-tab-${section.id}`}
          className="menu-panel"
          hidden={i !== active}
          tabIndex={0}
        >
          {section.groups.map((group) => (
            <MenuGroup key={group.title} group={group} />
          ))}
        </div>
      ))}
    </div>
  );
}
