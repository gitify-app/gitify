import type { FC } from 'react';

import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyIssueField, type GitifyLabels, IconColor } from '../../types';

import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
  issueFields?: GitifyIssueField[];
}

export const LabelsPill: FC<LabelsPillProps> = ({ labels, issueFields }) => {
  const fieldTokens = (issueFields ?? []).map((field) => ({
    text: `${field.name}: ${field.value}`,
    fillColor: field.fillColor,
  }));

  const labelsContent =
    labels?.length || fieldTokens.length ? (
      <LabelGroup>
        {fieldTokens.map((field) => (
          <IssueLabelToken
            fillColor={field.fillColor}
            key={field.text}
            size="small"
            text={field.text}
          />
        ))}
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
