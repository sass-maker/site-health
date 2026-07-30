import type { FeedbackSubmission } from './types';

function validateIngestionUrl(ingestionUrl: string): string {
  const trimmedUrl = ingestionUrl.trim();
  if (!trimmedUrl) {
    throw new Error('Feedback ingestion URL cannot be empty.');
  }

  let resolvedUrl: URL;
  try {
    const baseUrl = typeof document === 'undefined' ? 'http://localhost/' : document.baseURI;
    resolvedUrl = new URL(trimmedUrl, baseUrl);
  } catch {
    throw new Error('Feedback ingestion URL is invalid.');
  }

  if (resolvedUrl.protocol !== 'http:' && resolvedUrl.protocol !== 'https:') {
    throw new Error('Feedback ingestion URL must use HTTP or HTTPS.');
  }

  return trimmedUrl;
}

export async function submitFeedbackToUrl(
  ingestionUrl: string,
  submission: FeedbackSubmission
): Promise<void> {
  const destination = validateIngestionUrl(ingestionUrl);
  const { screenshot, ...feedback } = submission;
  const body = new FormData();
  body.append('feedback', JSON.stringify(feedback));
  if (screenshot) body.append('screenshot', screenshot);

  let response: Response;
  try {
    response = await fetch(destination, {
      method: 'POST',
      credentials: 'omit',
      body,
    });
  } catch (error) {
    const detail = error instanceof Error && error.message ? `: ${error.message}` : '';
    throw new Error(`Unable to reach the feedback endpoint${detail}`, { cause: error });
  }

  if (!response.ok) {
    throw new Error(`Feedback endpoint returned HTTP ${response.status}.`);
  }
}
