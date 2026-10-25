export function saveIdFor(work: { id: string; updatedAt: number }) {
  return `story:${encodeURIComponent(work.id)}@${work.updatedAt}`;
}
