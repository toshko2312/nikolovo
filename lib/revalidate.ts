import { revalidatePath } from 'next/cache';

/** Everything that renders event data, refreshed after a write. */
export function revalidateEventPages() {
  revalidatePath('/sabitiya');
  revalidatePath('/en/events');
  revalidatePath('/sitemap.xml');
}

/** Everything that renders news data, refreshed after a write. */
export function revalidateNewsPages() {
  revalidatePath('/novini');
  revalidatePath('/en/news');
  revalidatePath('/sitemap.xml');
}
