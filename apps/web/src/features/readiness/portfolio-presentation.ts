import { prerequisiteSatisfied, type Lever, type ScoreWorkspace } from './scoreboard';

// The existing queue rule, shared by the portfolio sheet and its next-queue card.
// Parked work can be resumed; completed/waiting work is never presented as queued.
export function isReadyLever(workspace: ScoreWorkspace, lever: Lever) {
  return lever.kind === 'action'
    && (!workspace.progress[lever.id] || workspace.progress[lever.id]?.status === 'parked')
    && lever.dependencies.every((id) => prerequisiteSatisfied(workspace, id));
}

export function productQueueLever(workspace: ScoreWorkspace, ordered: Lever[], projectId: string) {
  return ordered.find((lever) => lever.projectId === projectId && workspace.progress[lever.id]?.status === 'active')
    ?? ordered.find((lever) => lever.projectId === projectId && isReadyLever(workspace, lever));
}
