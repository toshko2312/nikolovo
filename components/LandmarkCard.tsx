import Image from 'next/image';
import AdminLandmarkItemControls from '@/components/admin/AdminLandmarkItemControls';
import { imageUrl } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { LandmarkCardRecord } from '@/lib/types';

export default function LandmarkCard({
  card,
  locale,
}: {
  card: LandmarkCardRecord;
  locale: Locale;
}) {
  return (
    <article className="card">
      <AdminLandmarkItemControls card={card} locale={locale} />

      <div className={card.image ? 'card-media' : 'card-media ph'}>
        {card.image ? (
          <Image
            src={imageUrl(card.image.path)}
            width={card.image.width}
            height={card.image.height}
            alt={card.image.alt[locale]}
            sizes="(max-width: 900px) 100vw, 380px"
          />
        ) : card.chip ? (
          <div className="chip">{card.chip[locale]}</div>
        ) : null}
      </div>
      <div className="card-body">
        <h2 className="card-title">{card.title[locale]}</h2>
        <p className="card-text">{card.text[locale]}</p>
      </div>
    </article>
  );
}
