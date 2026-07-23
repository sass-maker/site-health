# @saas-maker/feedback

A backend-free React feedback widget with optional screenshots and Pinpoint
page-element context. The package renders the interface; your application owns
submission and storage.

## Install

```bash
pnpm add @saas-maker/feedback
```

## Quick start

```tsx
import { FeedbackWidget } from '@saas-maker/feedback'
import '@saas-maker/feedback/dist/index.css'

export function AppFeedback() {
  return (
    <FeedbackWidget
      onSubmit={async (feedback) => {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...feedback,
            screenshot: undefined,
          }),
        })

        // feedback.screenshot is the original File. Upload it separately if needed.
      }}
    />
  )
}
```

`onSubmit` may send an email, create an issue, call your own API, or write to any
system your product already uses. The widget performs no network requests.

## Payload

```ts
interface FeedbackSubmission {
  type: 'bug' | 'feature' | 'feedback'
  title: string
  description: string
  email?: string
  name?: string
  anchor?: {
    selector: string
    tag: string | null
    text: string
    source: string | null
    url: string
  }
  screenshot?: File
  page: {
    url: string
    title: string
  }
}
```

The success state appears only after `onSubmit` resolves. If it throws, the
message is shown in the form.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSubmit` | `(feedback) => void \| Promise<void>` | required | Product-owned submission |
| `userEmail` | `string` | — | Pre-filled email |
| `userName` | `string` | — | Pre-filled name |
| `requireEmail` | `boolean` | `false` | Require an email before submission |
| `types` | `FeedbackType[]` | bug, feature, feedback | Allowed types |
| `position` | bottom-right or bottom-left | bottom-right | Trigger position |
| `theme` | light, dark, or auto | auto | Color theme |
| `accentColor` | `string` | `#1464ff` | Accent color |
| `triggerText` | `string` | Feedback | Trigger label |
| `enablePointing` | `boolean` | `true` | Enable Pinpoint |

## Pinpoint

Pinpoint lets the user click a page element. The callback receives a selector,
visible text, page path, and source hint when React development metadata or a
`data-source` attribute is available. No data leaves the browser until your
callback sends it.

## Screenshots

JPEG, PNG, GIF, and WebP files up to 5 MB can be attached. The callback receives
the original `File`; the package does not upload or retain it. Process the file
before the callback resolves if it must be stored.

## Privacy

Your product controls the destination and retention policy. Disclose collected
feedback, identity fields, screenshots, and page-element context in your own
privacy policy where appropriate.

## Compatibility

- React 18 and React 19
- Modern browsers with `File`, `URL.createObjectURL`, and DOM APIs
- Client-rendered components

## License

MIT
