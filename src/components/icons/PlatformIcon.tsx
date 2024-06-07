import { MarkGithubIcon, ServerIcon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { PlatformType } from '../../utils/auth/types';

export interface IPlatformIcon {
  type: PlatformType;
  size: number;
}

export const PlatformIcon: FC<IPlatformIcon> = (props: IPlatformIcon) => {
  return (
    <span aria-label={props.type} className="mr-1">
      {props.type === 'GitHub Cloud' ? (
        <MarkGithubIcon size={props.size} />
      ) : null}
      {props.type === 'GitHub Enterprise Server' ? (
        <ServerIcon size={props.size} />
      ) : null}
    </span>
  );
};
