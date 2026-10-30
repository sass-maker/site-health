const labels = {
  'ai-powered': 'AI-powered',
  'agent-operable': 'Agent-operable',
  'ai-enabling': 'AI-enabling',
};

export function productAiRoles(profile) {
  return [...new Set(profile?.roles ?? [])].map(role => labels[role]).filter(Boolean);
}

export function productAiLabel(profile) {
  if (!profile) return 'AI role not reviewed';
  return productAiRoles(profile).join(' · ') || 'No active AI workflow';
}

export function productAiEvidenceLabel(profile) {
  if (profile?.runtimeQualification === 'verified' && profile?.runtimeEvidence?.length) {
    return 'Runtime verified';
  }
  return profile?.evidence?.length ? 'Source reviewed · runtime unverified' : 'Not verified';
}
