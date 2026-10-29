import { CheckCircleFillIcon, DashIcon, XCircleFillIcon } from '@primer/octicons-react';

import i18n from '../i18n';

export interface ScopeStatusIconProps {
  granted: boolean;
  notApplicable?: boolean;
  size?: number;
  /** What the status describes (e.g. a scope name), prefixed to the accessible name. */
  subject?: string;
}

export function ScopeStatusIcon({
  granted,
  notApplicable = false,
  size = 14,
  subject,
}: Readonly<ScopeStatusIconProps>) {
  const ariaLabel = getScopeStatusLabel(granted, notApplicable, subject);

  if (notApplicable) {
    return <DashIcon aria-label={ariaLabel} className="opacity-30" size={size} />;
  }

  return granted ? (
    <CheckCircleFillIcon aria-label={ariaLabel} className="text-gitify-success" size={size} />
  ) : (
    <XCircleFillIcon aria-label={ariaLabel} className="text-gitify-danger" size={size} />
  );
}

function getScopeStatusLabel(granted: boolean, notApplicable: boolean, subject?: string): string {
  if (notApplicable) {
    return subject
      ? i18n.t('scopes.status.not_applicable_subject', '{{subject}} not applicable', { subject })
      : i18n.t('scopes.status.not_applicable', 'not applicable');
  }
  if (granted) {
    return subject
      ? i18n.t('scopes.status.granted_subject', '{{subject}} granted', { subject })
      : i18n.t('scopes.status.granted', 'granted');
  }
  return subject
    ? i18n.t('scopes.status.missing_subject', '{{subject}} missing', { subject })
    : i18n.t('scopes.status.missing', 'missing');
}
