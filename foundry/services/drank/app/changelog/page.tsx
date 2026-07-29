import type { Metadata } from 'next';
import { ChangelogView } from './view';

export const metadata: Metadata = {
  title: 'drank changelog · Domain Rating Watch',
  description: 'Verified updates to drank, the browser-local Domain Rating tracker.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  return <ChangelogView />;
}
