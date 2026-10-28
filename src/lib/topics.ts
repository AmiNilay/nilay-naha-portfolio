/**
 * Shared topic taxonomy for blog posts and projects.
 *
 * Topics are stored as ordinary tags (listed first, so cards show them); the
 * public filter chips only offer these topics — never raw tech tags — so each
 * filter groups several items instead of matching one. Give every post and
 * project 1–3 topics; tech tags (Kotlin, PyQt5, …) can follow them.
 * Renaming a topic means updating the stored tags too.
 */
export const TOPICS = [
  "AI & Machine Learning",
  "Web Development",
  "Backend & APIs",
  "Mobile Apps",
  "Desktop Apps",
  "Security & Privacy",
  "Career & Learning",
] as const;

export type Topic = (typeof TOPICS)[number];

const norm = (s: string) => s.trim().toLowerCase();
const TOPIC_BY_KEY = new Map<string, Topic>(TOPICS.map((t) => [norm(t), t]));

/** The taxonomy topics among an item's tags, in taxonomy order. */
export function topicsOf(tags: readonly string[] | undefined | null): Topic[] {
  const keys = new Set((tags || []).map(norm));
  return TOPICS.filter((t) => keys.has(norm(t)));
}

export const isTopic = (tag: string) => TOPIC_BY_KEY.has(norm(tag));

/** Topics used by at least one item, with counts, in taxonomy order. */
export function topicCounts(items: readonly { tags?: readonly string[] | null }[]) {
  const counts = new Map<Topic, number>();
  for (const item of items) for (const t of topicsOf(item.tags)) counts.set(t, (counts.get(t) || 0) + 1);
  return TOPICS.filter((t) => counts.has(t)).map((topic) => ({ topic, count: counts.get(topic)! }));
}

/** Does an item belong to the selected topic? */
export const hasTopic = (tags: readonly string[] | undefined | null, topic: string) =>
  (tags || []).some((t) => norm(t) === norm(topic));
