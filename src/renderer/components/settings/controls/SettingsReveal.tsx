import type { ReactNode } from 'react';

import { cn } from 'cn';

export interface SettingsRevealProps {
  name?: string;
  open: boolean;
  children: ReactNode;
}

export function SettingsReveal({ name, open, children }: Readonly<SettingsRevealProps>) {
  return (
    <div
      aria-hidden={!open}
      data-state={open ? 'open' : 'closed'}
      data-testid={name ? `reveal-${name}` : undefined}
      className={cn(
        'grid transition-all duration-200 motion-reduce:transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
      inert={!open}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
