import { useTranslation } from 'react-i18next';

import { IssueOpenedIcon } from '@primer/octicons-react';

import type { GitifyIssueType } from '../../types';

import { MetricPill } from './MetricPill';

export interface IssueTypesPillProps {
  issueType?: GitifyIssueType;
}

export function IssueTypesPill({ issueType }: Readonly<IssueTypesPillProps>) {
  const { t } = useTranslation();
  if (!issueType) {
    return null;
  }

  return (
    <MetricPill
      ariaLabel={t('metrics.issue_type', 'Issue type: {{name}}', { name: issueType.name })}
      color={issueType.color}
      contents={issueType.name}
      icon={IssueOpenedIcon}
    />
  );
}
