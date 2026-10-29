import type { Chevron } from '../../types';

import i18n from '../../i18n';

export interface ParsedCodePart {
  id: string;
  type: 'text' | 'code';
  content: string;
}

/**
 * Returns the appropriate chevron direction and accessible label for a collapsible section.
 *
 * @param hasNotifications - Whether the section has any notifications to display.
 * @param isVisible - Whether the section is currently expanded/visible.
 * @param type - The type of section (`'account'` or `'repository'`).
 * @returns A `Chevron` object containing the direction and its accessible label.
 */
export function getChevronDetails(
  hasNotifications: boolean,
  isVisible: boolean,
  type: 'account' | 'repository',
): Chevron {
  const typeLabel =
    type === 'account'
      ? i18n.t('chevron.account', 'account')
      : i18n.t('chevron.repository', 'repository');

  if (!hasNotifications) {
    return {
      direction: 'left',
      label: i18n.t('chevron.none', 'No notifications for {{type}}', { type: typeLabel }),
    };
  }

  if (isVisible) {
    return {
      direction: 'down',
      label: i18n.t('chevron.hide', 'Hide {{type}} notifications', { type: typeLabel }),
    };
  }

  return {
    direction: 'right',
    label: i18n.t('chevron.show', 'Show {{type}} notifications', { type: typeLabel }),
  };
}

/**
 * Parse inline code blocks (text wrapped in backticks) from a string.
 * Returns an array of parts where each part is either plain text or code.
 *
 * @param text - The text to parse
 * @returns Array of parts with type and content
 */
export function parseInlineCode(text: string): ParsedCodePart[] {
  const regex = /`(?<code>[^`]+)`|(?<text>[^`]+)/g;
  const matches = Array.from(text.matchAll(regex));

  if (matches.length === 0) {
    return [{ id: '0', type: 'text', content: text }];
  }

  return matches.map((match, index) => ({
    id: String(index),
    type: match.groups?.code ? 'code' : 'text',
    content: match.groups?.code ?? match.groups?.text ?? '',
  }));
}
