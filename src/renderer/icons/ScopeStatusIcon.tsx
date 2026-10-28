import { CheckCircleFillIcon, DashIcon, XCircleFillIcon } from '@primer/octicons-react';

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
  let status = granted ? 'granted' : 'missing';
  if (notApplicable) {
    status = 'not applicable';
  }
  const ariaLabel = subject ? `${subject} ${status}` : status;

  if (notApplicable) {
    return <DashIcon aria-label={ariaLabel} className="opacity-30" size={size} />;
  }

  return granted ? (
    <CheckCircleFillIcon aria-label={ariaLabel} className="text-gitify-success" size={size} />
  ) : (
    <XCircleFillIcon aria-label={ariaLabel} className="text-gitify-danger" size={size} />
  );
}
