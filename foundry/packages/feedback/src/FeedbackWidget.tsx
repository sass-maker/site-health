import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ElementPicker } from './components/ElementPicker';
import { Modal } from './components/Modal';
import { TriggerButton } from './components/TriggerButton';
import type { ElementAnchor } from './elementAnchor';
import { submitFeedbackToUrl } from './ingestion';
import type { FeedbackSubmission, FeedbackWidgetProps } from './types';
import './styles/widget.css';

const DEFAULT_TYPES = ['bug', 'feature', 'feedback'] as const;
const DEFAULT_ACCENT = '#1464ff';
const DEFAULT_TRIGGER_TEXT = 'Feedback';

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  onSubmit,
  ingestionUrl,
  userEmail,
  userName,
  requireEmail = false,
  types,
  position = 'bottom-right',
  theme = 'auto',
  accentColor = DEFAULT_ACCENT,
  triggerText = DEFAULT_TRIGGER_TEXT,
  enablePointing = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Picking overlays the page; we keep the modal mounted (hidden) so the user's
  // in-progress title/description survive the round-trip and the captured anchor
  // lands back in the same form.
  const [picking, setPicking] = useState(false);
  const [anchor, setAnchor] = useState<ElementAnchor | null>(null);

  const startPick = useCallback(() => setPicking(true), []);
  const handlePick = useCallback((a: ElementAnchor) => {
    setAnchor(a);
    setPicking(false);
  }, []);
  const cancelPick = useCallback(() => setPicking(false), []);
  const clearAnchor = useCallback(() => setAnchor(null), []);
  const submitFeedback = useMemo(() => {
    const hasCallback = typeof onSubmit === 'function';
    const hasIngestionUrl = typeof ingestionUrl === 'string' && ingestionUrl.trim().length > 0;

    if (hasCallback && !hasIngestionUrl) return onSubmit;
    if (!hasCallback && hasIngestionUrl) {
      return (submission: FeedbackSubmission) => submitFeedbackToUrl(ingestionUrl, submission);
    }

    return async () => {
      if (hasCallback) {
        throw new Error('FeedbackWidget accepts either onSubmit or ingestionUrl, not both.');
      }
      throw new Error('FeedbackWidget requires an onSubmit callback or ingestionUrl.');
    };
  }, [ingestionUrl, onSubmit]);

  const resolvedTypes = types && types.length > 0 ? types : [...DEFAULT_TYPES];

  const themeClass =
    theme === 'light' ? 'smw--light' : theme === 'dark' ? 'smw--dark' : 'smw--auto';

  return (
    <div
      data-feedback-widget=""
      className={`smw-root ${themeClass}`}
      style={{ '--smw-accent': accentColor } as React.CSSProperties}
    >
      <TriggerButton
        onClick={() => setIsOpen(true)}
        position={position}
        accentColor={accentColor}
        triggerText={triggerText}
      />
      <Modal
        isOpen={isOpen}
        hidden={picking}
        onClose={() => setIsOpen(false)}
        onSubmit={submitFeedback}
        userEmail={userEmail}
        userName={userName}
        requireEmail={requireEmail}
        types={resolvedTypes}
        accentColor={accentColor}
        enablePointing={enablePointing}
        anchor={anchor}
        onStartPick={startPick}
        onClearAnchor={clearAnchor}
      />
      {enablePointing && (
        <ElementPicker active={picking} onPick={handlePick} onCancel={cancelPick} />
      )}
    </div>
  );
};
