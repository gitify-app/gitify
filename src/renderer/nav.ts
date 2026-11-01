export type NavDestinationId = 'home' | 'filters' | 'settings';

export interface NavDestination {
  /** Stable identifier used to map presentation details such as the icon. */
  id: NavDestinationId;
  /** Route the destination resolves to. */
  path: '/' | '/filters' | '/settings';
  /** Translation key for the destination's accessible name. */
  labelKey: string;
  /** Translation key for the tooltip description. */
  descriptionKey: string;
  /** Keyboard key that activates the destination. */
  shortcutKey: string;
  /** Whether the destination only matches its exact path. */
  exact?: boolean;
}

/**
 * Destinations shared by the sidebar and the keyboard shortcuts.
 * Plain data only: presentation (icons, labels) lives with the renderer.
 */
export const NAV_ITEMS: readonly NavDestination[] = [
  {
    id: 'home',
    path: '/',
    labelKey: 'sidebar.home',
    descriptionKey: 'sidebar.home',
    shortcutKey: 'h',
    exact: true,
  },
  {
    id: 'filters',
    path: '/filters',
    labelKey: 'sidebar.filters',
    descriptionKey: 'sidebar.filter_notifications',
    shortcutKey: 'f',
  },
  {
    id: 'settings',
    path: '/settings',
    labelKey: 'sidebar.settings',
    descriptionKey: 'settings.title',
    shortcutKey: 's',
  },
];

export function getNavItem(id: NavDestinationId): NavDestination {
  const item = NAV_ITEMS.find((destination) => destination.id === id);

  if (!item) {
    throw new Error(`Unknown navigation destination: ${id}`);
  }

  return item;
}
