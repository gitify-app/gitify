import { AppsIcon, KeyIcon, PersonIcon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { AuthMethod } from '../../utils/auth/types';

export interface IAuthMethodIcon {
  type: AuthMethod;
  size: number;
}

export const AuthMethodIcon: FC<IAuthMethodIcon> = (props: IAuthMethodIcon) => {
  return (
    <span aria-label={props.type} className="mr-1">
      {props.type === 'GitHub App' ? <AppsIcon size={props.size} /> : null}
      {props.type === 'Personal Access Token' ? (
        <KeyIcon size={props.size} />
      ) : null}
      {props.type === 'OAuth App' ? <PersonIcon size={props.size} /> : null}
    </span>
  );
};
