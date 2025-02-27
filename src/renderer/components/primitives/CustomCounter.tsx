import type { FC } from 'react';

import { Text } from '@primer/react';

import { cn } from '../../utils/cn';

type CounterScheme = 'primary' | 'secondary' | 'empty';

interface ICustomCounter {
  /** The content to display within the counter */
  value: string | number;
  /** The visual style of the counter */
  scheme?: CounterScheme;
}

/**
 * CustomCounter is a component that displays a small count or numeric indicator,
 * similar to CounterLabel from @primer/react but with customizable styling.
 *
 * Created due to odd behavior with CounterLabel:
 * - would show screen vertical scrollbar which is undesirable.
 * - would not render '0' within a counter.
 */
export const CustomCounter: FC<ICustomCounter> = ({
  value,
  scheme = 'secondary',
}) => {
  const baseStyles =
    'px-1.5 py-0.75 rounded-full text-[10px] font-medium leading-none min-w-[16px] text-gitify-counter-text';

  const schemeStyles = {
    primary: 'bg-gitify-counter-primary',
    secondary: 'bg-gitify-counter-secondary',
  };

  return <Text className={cn(baseStyles, schemeStyles[scheme])}>{value}</Text>;
};
