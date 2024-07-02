import * as SliderPrimitive from '@radix-ui/react-slider';

import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
  forwardRef,
} from 'react';
import { cn } from '../../utils/cn';

export type ISlider = SliderPrimitive.SliderProps &
  RefAttributes<HTMLSpanElement> & { unit?: string; visualSteps?: number };

export const Slider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<ForwardRefExoticComponent<ISlider>>
>(
  (
    { className, min, max, step, name, unit = '', visualSteps = 0, ...props },
    ref,
  ) => {
    const steps = visualSteps || (max - min) / step;
    const stepAmount = visualSteps ? (max - min) / visualSteps : step;
    const length = steps % 2 === 0 ? steps + 1 : steps;

    return (
      <div className={cn('flex flex-col', className)}>
        {name && (
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            htmlFor={name}
          >
            {name}:
          </label>
        )}
        <SliderPrimitive.Root
          ref={ref}
          className="grid touch-none select-none items-center mb-2 mx-4"
          min={min}
          max={max}
          step={step}
          name={name}
          {...props}
        >
          <div className="flex h-full relative">
            <SliderPrimitive.Track className="relative h-2 bg-clip-padding dark:bg-white overflow-visible bg-gray-300 rounded-full w-full">
              <SliderPrimitive.Range className="absolute h-full bg-blue-500 rounded-full border-x-[6px] border-transparent" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block -mt-1 h-4 w-4 rounded-full border border-blue-500 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
          </div>
          <div className="relative -mx-3 grow flex flex-row justify-between mt-1">
            {Array.from({ length }).map((_, i) => {
              const value =
                i === 0
                  ? min
                  : i * stepAmount + min === (max + min) / 2
                    ? (max + min) / 2
                    : i * stepAmount + min === max
                      ? max
                      : '|';

              return (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: This is a static array
                  key={`${name}-${i}`}
                  className={cn(
                    'text-xs font-light w-10 text-center',
                    value === '|' && 'opacity-40',
                  )}
                  role="presentation"
                >
                  {value}
                  {value !== '|' && unit}
                </span>
              );
            })}
          </div>
        </SliderPrimitive.Root>
      </div>
    );
  },
);
