import { revalidatePath } from 'next/cache';

/** Everything that renders event data, refreshed after a write. */
export function revalidateEventPages() {
  revalidatePath('/sabitiya');
  revalidatePath('/en/events');
  revalidatePath('/sitemap.xml');
}
