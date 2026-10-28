import type { ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Heading, Stack } from '@primer/react';

import { HelpPopover } from './HelpPopover';

type SectionHeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface SectionHeadingProps {
  icon: Icon;
  children: string;
  /**
   * Render a heading for standalone use, or a legend when the heading labels a
   * fieldset. Defaults to a level-4 heading.
   */
  as?: SectionHeadingTag | 'legend';
  tooltip?: ReactNode;
}

export function SectionHeading({ as = 'h4', ...props }: Readonly<SectionHeadingProps>) {
  const name = props.children.toLowerCase().replaceAll(' ', '-');
  const headingTag = as === 'legend' ? 'h4' : as;

  const tooltip = props.tooltip && (
    <HelpPopover
      content={
        <Stack direction="vertical" gap="condensed">
          {props.tooltip}
        </Stack>
      }
      label={props.children}
      name={`tooltip-${name}`}
    />
  );

  const content = (
    <div className="mb-2">
      <Stack align="center" direction="horizontal" gap="condensed" id={`title-${name}`}>
        <props.icon size="small" />
        <Heading as={headingTag}>{props.children}</Heading>
        {tooltip}
      </Stack>
    </div>
  );

  if (as === 'legend') {
    return (
      <>
        <legend className="sr-only">{props.children}</legend>
        {content}
      </>
    );
  }

  return content;
}
