import type { Icon } from '@primer/octicons-react';
import { type VariantProps, cva } from 'class-variance-authority';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { type Link, Size } from '../../types';
import { cn } from '../../utils/cn';
import { openExternalLink } from '../../utils/comms';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-ring inline-flex w-fit items-center justify-center whitespace-nowrap rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gray-300 dark:text-black hover:opacity-90',
        destructive: 'bg-red-600 text-white hover:opacity-90',
        outline:
          'border-zinc-300 hover:text-inherit dark:hover:text-white border bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-600',
        ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-600 dark:hover:text-white',
        link: 'underline-offset-2 hover:underline',
      },
      size: {
        default: 'min-w-20 h-10 px-4 py-1',
        inline: 'h-5 rounded-md px-2 py-1',
        xs: 'h-7 rounded-md px-2 py-1',
        sm: 'h-9 rounded-md px-2 py-1',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface IButton
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: { icon: Icon; size?: Size };
  url?: Link;
  onClick?: () => void;
  label: string;
}

const Button = forwardRef<HTMLButtonElement, IButton>(
  ({ className, variant, size, label, url, onClick, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        aria-label={label}
        onClick={() => {
          if (url) {
            return openExternalLink(url);
          }

          if (onClick) {
            return onClick();
          }
        }}
        {...props}
      >
        {props.icon && (
          <props.icon.icon
            className="mr-2"
            size={props.icon.size || Size.MEDIUM}
          />
        )}
        {props.children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
