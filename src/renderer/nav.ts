export type NavDestinationId = 'home' | 'filters' | 'settings';

export interface NavDestination {
  /** Stable identifier used to map presentation details such as the icon. */
  id: NavDestinationId;
  /** Route the destination resolves to. */
  path: '/' | '/filters' | '/settings';
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
    shortcutKey: 'h',
    exact: true,
  },
  {
    id: 'filters',
    path: '/filters',
    shortcutKey: 'f',
  },
  {
    id: 'settings',
    path: '/settings',
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
