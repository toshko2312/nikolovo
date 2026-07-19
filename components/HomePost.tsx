import Image from 'next/image';
import Link from 'next/link';
import AdminPostItemControls from '@/components/admin/AdminPostItemControls';
import { imageUrl } from '@/lib/media';
import { paths, type Locale } from '@/lib/routes';
import type { HomePostRecord } from '@/lib/types';

export default function HomePost({
  post,
  locale,
  index,
  isFirst,
}: {
  post: HomePostRecord;
  locale: Locale;
  index: number;
  isFirst: boolean;
}) {
  // Matches the original hand-written markup: every other section mirrors image/text sides.
  const imageOnRight = index % 2 === 1;
  const mediaClass = [post.image ? 'media' : 'media ph', imageOnRight ? 'order-img' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={isFirst ? 'section first' : 'section'}>
      <AdminPostItemControls post={post} locale={locale} />

      <div className="section-inner split">
        <div className={mediaClass}>
          {post.image ? (
            <Image
              src={imageUrl(post.image.path)}
              width={post.image.width}
              height={post.image.height}
              alt={post.image.alt[locale]}
              sizes="(max-width: 900px) 100vw, 560px"
            />
          ) : null}
        </div>
        <div>
          <p className="eyebrow section-eyebrow">{post.eyebrow[locale]}</p>
          <h2 className="section-title">{post.title[locale]}</h2>
          <p className="prose">{post.body[locale]}</p>
          {post.link ? (
            <Link className="link-accent" href={paths[post.link.page][locale]}>
              {post.link.text[locale]}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
