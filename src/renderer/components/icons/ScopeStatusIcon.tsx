import type { FC } from 'react';

import {
  CheckCircleFillIcon,
  DashIcon,
  XCircleFillIcon,
} from '@primer/octicons-react';

export interface ScopeStatusIconProps {
  granted: boolean;
  notApplicable?: boolean;
  size?: number;
  withTestId?: boolean;
}

export const ScopeStatusIcon: FC<ScopeStatusIconProps> = ({
  granted,
  notApplicable = false,
  size = 14,
  withTestId = false,
}) => {
  if (notApplicable) {
    return (
      <DashIcon
        className="opacity-30"
        data-testid={withTestId ? 'account-scopes-scope-na' : undefined}
        size={size}
      />
    );
  }

  return granted ? (
    <CheckCircleFillIcon
      className="text-gitify-success"
      data-testid={withTestId ? 'account-scopes-scope-granted' : undefined}
      size={size}
    />
  ) : (
    <XCircleFillIcon
      className="text-gitify-danger"
      data-testid={withTestId ? 'account-scopes-scope-missing' : undefined}
      size={size}
    />
  );
};
