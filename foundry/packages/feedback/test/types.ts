import type { FeedbackWidgetProps } from '../src';

const callbackDestination: FeedbackWidgetProps = {
  onSubmit: async () => {},
};

const urlDestination: FeedbackWidgetProps = {
  ingestionUrl: '/api/feedback',
};

// @ts-expect-error A destination is required.
const missingDestination: FeedbackWidgetProps = {};

// @ts-expect-error Two destinations could duplicate a submission.
const conflictingDestinations: FeedbackWidgetProps = {
  ingestionUrl: '/api/feedback',
  onSubmit: async () => {},
};

void callbackDestination;
void urlDestination;
void missingDestination;
void conflictingDestinations;
