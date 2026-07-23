import type { ElementAnchor } from './elementAnchor';

export type FeedbackType = 'bug' | 'feature' | 'feedback';

export interface FeedbackPageContext {
  url: string;
  title: string;
}

export interface FeedbackSubmission {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
  name?: string;
  anchor?: ElementAnchor;
  /** The original browser File. Upload or persist it before the callback resolves. */
  screenshot?: File;
  page: FeedbackPageContext;
}

export interface FeedbackWidgetProps {
  onSubmit: (feedback: FeedbackSubmission) => void | Promise<void>;
  userEmail?: string;
  userName?: string;
  requireEmail?: boolean;
  types?: FeedbackType[];
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  triggerText?: string;
  /** Allow pointing at a page element to capture selector, text, source, and URL. */
  enablePointing?: boolean;
}
