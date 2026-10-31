/**
 * Status Card Component
 *
 * A pure JavaScript factory function that renders a reusable status card element.
 * No framework — just DOM APIs. Cards are inserted into the dashboard grid.
 *
 * Usage:
 *   const card = StatusCard.create({
 *     id:       'db-status-card',
 *     variant:  'success',          // 'success' | 'error' | 'warning' | 'offline' | 'brand'
 *     iconSvg:  '<svg>...</svg>',
 *     label:    'Database Status',
 *     value:    'Connected',
 *     subText:  'retail-next.db',
 *     badge:    { text: 'Online', variant: 'success' },
 *   });
 *   document.getElementById('grid').appendChild(card);
 *
 * The component exposes an update() method on the returned element
 * to reactively update values without re-creating the DOM node.
 */

/* global StatusCard */

const StatusCard = (() => {

  /**
   * SVG icon strings for common status card icons.
   * Keeps the icon library self-contained — no external icon font needed.
   */
  const ICONS = {
    database: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    wifi_off: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>`,
    activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
  };

  /**
   * Creates a status badge element.
   * @param {{ text: string, variant: string }} badge
   * @returns {HTMLElement}
   */
  function createBadge(badge) {
    const el = document.createElement('div');
    el.className = `status-badge status-badge--${badge.variant}`;
    el.innerHTML = `<span class="badge-dot badge-dot--${badge.variant}"></span>${badge.text}`;
    return el;
  }

  /**
   * Creates a status card DOM element.
   *
   * @param {{
   *   id:       string,
   *   variant:  'success'|'error'|'warning'|'offline'|'brand',
   *   iconName: keyof ICONS,
   *   label:    string,
   *   value:    string,
   *   subText?: string,
   *   badge?:   { text: string, variant: string },
   * }} config
   * @returns {HTMLElement} — Enhanced with an `update(partial)` method.
   */
  function create(config) {
    const card = document.createElement('div');
    card.className = `status-card status-card--${config.variant}`;
    card.id = config.id;

    card.innerHTML = `
      <div class="status-card__header">
        <div>
          <div class="status-card__label">${config.label}</div>
          <div class="status-card__value" data-field="value">${config.value}</div>
          ${config.subText ? `<div class="status-card__sub" data-field="subText">${config.subText}</div>` : ''}
        </div>
        <div class="status-card__icon-wrap">
          ${ICONS[config.iconName] || ICONS.info}
        </div>
      </div>
      <div data-field="badge"></div>
    `;

    if (config.badge) {
      card.querySelector('[data-field="badge"]').appendChild(createBadge(config.badge));
    }

    /**
     * Reactively update card fields without full re-render.
     * @param {{ value?: string, subText?: string, badge?: object, variant?: string }} partial
     */
    card.update = function (partial) {
      if (partial.value !== undefined) {
        const el = card.querySelector('[data-field="value"]');
        if (el) el.textContent = partial.value;
      }
      if (partial.subText !== undefined) {
        let el = card.querySelector('[data-field="subText"]');
        if (!el) {
          el = document.createElement('div');
          el.className = 'status-card__sub';
          el.setAttribute('data-field', 'subText');
          card.querySelector('.status-card__header > div').appendChild(el);
        }
        el.textContent = partial.subText;
      }
      if (partial.badge !== undefined) {
        const slot = card.querySelector('[data-field="badge"]');
        slot.innerHTML = '';
        slot.appendChild(createBadge(partial.badge));
      }
      if (partial.variant !== undefined) {
        // Remove old variant class, add new one.
        card.className = card.className.replace(/status-card--\w+/, '');
        card.classList.add(`status-card--${partial.variant}`);
      }
    };

    return card;
  }

  return { create, ICONS };
})();
