import type { FC, ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Heading, Stack } from '@primer/react';

import { Tooltip } from '../fields/Tooltip';

interface ITitle {
  icon: Icon;
  children: string;
  size?: number;
  tooltip?: ReactNode;
}

export const Title: FC<ITitle> = ({ size = 2, ...props }) => {
  const name = props.children.toLowerCase().replaceAll(' ', '-');

  return (
    <legend>
      <div className="mb-2">
        <Stack
          align="center"
          direction="horizontal"
          gap="condensed"
          id={`title-${name}`}
        >
          <props.icon size="small" />
          <Heading as="h4">{props.children}</Heading>
          {props.tooltip && (
            <Tooltip
              name={`tooltip-${name}`}
              tooltip={
                <Stack direction="vertical" gap="condensed">
                  {props.tooltip}
                </Stack>
              }
            />
          )}
        </Stack>
      </div>
    </legend>
  );
};
