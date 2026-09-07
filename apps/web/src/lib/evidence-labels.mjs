// Presentation only: backend freshness policy and collection decisions stay unchanged.
export function evidenceStateLabel(source) {
  if (["refreshing", "failed", "unavailable"].includes(source?.state)) return source.state;
  if (!source?.observedAt) return "Not measured";
  return source.state ?? "Evidence available";
}

export function refreshAttemptLabel(source, formatDate) {
  return source?.lastAttemptAt
    ? `last refresh attempt ${formatDate(source.lastAttemptAt)}`
    : "no refresh attempt recorded";
}
