import * as SliderPrimitive from '@radix-ui/react-slider';

import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type RefAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn';

export type ISlider = SliderPrimitive.SliderProps &
  RefAttributes<HTMLSpanElement>;

export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, min, max, step, name, ...props }, ref) => {
  const range = max - min;
  const length = range / step + 1;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative grid w-full touch-none select-none items-center mb-3',
        className,
      )}
      min={min}
      max={max}
      step={step}
      name={name}
      {...props}
    >
      {name && (
        <label
          className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={name}
        >
          {name}:
        </label>
      )}
      <SliderPrimitive.Track className="relative h-2 bg-clip-padding dark:bg-white mx-[1rem] overflow-visible bg-gray-300 rounded-full grow">
        <SliderPrimitive.Range className="absolute h-full bg-blue-500 rounded-full border-x-[6px] border-transparent" />
        <SliderPrimitive.Thumb className="block -mt-1 h-4 w-4 rounded-full border border-blue-500 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Track>
      <div className="relative mx-3 grow flex flex-row justify-between mt-1">
        {Array.from({ length }).map((_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array
            key={`${name}-${i}`}
            className={cn('text-sm font-light', {
              'text-10 opacity-40':
                i > min / step && i + 1 < (max - min) / step,
            })}
            role="presentation"
          >
            {i === 0
              ? min
              : i * step + min === (max + min) / 2
                ? (max + min) / 2
                : i * step + min === max
                  ? max
                  : '|'}
          </span>
        ))}
      </div>
    </SliderPrimitive.Root>
  );
});
