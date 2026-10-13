import type { FC } from 'react';

import { MarkdownBody } from './MarkdownBody';

export interface SubjectBodyPreviewProps {
  /** GitHub-rendered HTML body of the issue or pull request. */
  bodyHtml: string;
}

/**
 * Preview of a notification subject's (issue or pull request) body, rendered
 * with its formatting preserved and sanitised. The card scroll-caps long
 * bodies.
 */
export const SubjectBodyPreview: FC<SubjectBodyPreviewProps> = ({ bodyHtml }) => {
  return <MarkdownBody html={bodyHtml} testId="subject-body-preview" />;
};
