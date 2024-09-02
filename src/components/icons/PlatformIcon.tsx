import { BeakerIcon, MarkGithubIcon, ServerIcon } from '@primer/octicons-react';
import type { FC } from 'react';
import type { Size } from '../../types';
import type { PlatformType } from '../../utils/auth/types';

export interface IPlatformIcon {
  type: PlatformType;
  size: Size;
}

export const PlatformIcon: FC<IPlatformIcon> = (props: IPlatformIcon) => {
  return (
    <span title={props.type} className="mr-1">
      {props.type === 'GitHub Cloud' && <MarkGithubIcon size={props.size} />}
      {props.type === 'GitHub Enterprise Server' && (
        <ServerIcon size={props.size} />
      )}
      {props.type === 'Bitbucket Cloud' && <BeakerIcon size={props.size} />}
    </span>
  );
};
