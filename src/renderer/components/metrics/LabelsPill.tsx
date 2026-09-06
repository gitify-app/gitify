import type { CSSProperties, FC } from 'react';

import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyIssueField, type GitifyLabels, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
  issueFields?: GitifyIssueField[];
}

/**
 * Resolve an {@link IconColor} token (a `text-gitify-icon-*` Tailwind class) to
 * the Primer-backed CSS variable it maps to. Primer's label token styles set
 * their own computed `color`, which would beat the utility class in the
 * cascade, so the field colour is applied inline instead.
 */
export const iconColorCssVar = (color: IconColor): string =>
  `var(--${color.replace('text-gitify-icon-', 'gitify-icon-')})`;

export const LabelsPill: FC<LabelsPillProps> = ({ labels, issueFields }) => {
  const fieldTokens = (issueFields ?? []).map((field) => ({
    text: `${field.name}: ${field.value}`,
    color: field.color,
  }));

  const labelsContent =
    labels?.length || fieldTokens.length ? (
      <LabelGroup>
        {fieldTokens.map((field) => {
          const style: CSSProperties | undefined = field.color
            ? { color: iconColorCssVar(field.color) }
            : undefined;

          return (
            <IssueLabelToken
              className={field.color}
              key={field.text}
              size="small"
              style={style}
              text={field.text}
            />
          );
        })}
        {(labels ?? []).map((label) => {
          return (
            <IssueLabelToken
              fillColor={label.color ? `#${label.color}` : undefined}
              key={label.name}
              size="small"
              text={label.name}
            />
          );
        })}
      </LabelGroup>
    ) : null;

  if (!labelsContent) {
    return null;
  }

  return (
    <MetricPill
      color={IconColor.GRAY}
      contents={labelsContent}
      icon={TagIcon}
      metric={fieldTokens.length + (labels?.length ?? 0)}
    />
  );
};
