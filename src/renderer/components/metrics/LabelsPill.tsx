import { TagIcon } from '@primer/octicons-react';
import { IssueLabelToken, LabelGroup } from '@primer/react';

import { type GitifyIssueField, type GitifyLabels, IconColor } from '../../types';

import { formatMetricDescription } from '../../utils/notifications/formatters';
import { MetricPill } from './MetricPill';

export interface LabelsPillProps {
  labels: GitifyLabels[];
  issueFields?: GitifyIssueField[];
  labelCount?: number;
}

export function LabelsPill({ labels, issueFields, labelCount }: Readonly<LabelsPillProps>) {
  const fieldTokens = (issueFields ?? []).map((field) => ({
    text: `${field.name}: ${field.value}`,
    fillColor: field.fillColor,
  }));

  const totalLabelCount = labelCount ?? labels?.length ?? 0;

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

  const labelNames = [
    ...fieldTokens.map((field) => field.text),
    ...(labels ?? []).map((label) => label.name),
  ];

  return (
    <MetricPill
      ariaLabel={`${formatMetricDescription(fieldTokens.length + totalLabelCount, 'label')}: ${labelNames.join(', ')}`}
      color={IconColor.GRAY}
      contents={labelsContent}
      icon={TagIcon}
      metric={fieldTokens.length + totalLabelCount}
    />
  );
}
