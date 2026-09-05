import AdminGalleryItemControls from '@/components/admin/AdminGalleryItemControls';
import ZoomableImage from '@/components/ZoomableImage';
import { imageUrl } from '@/lib/media';
import type { Locale } from '@/lib/routes';
import type { GalleryPhotoRecord } from '@/lib/types';

export default function GalleryPhoto({
  photo,
  locale,
}: {
  photo: GalleryPhotoRecord;
  locale: Locale;
}) {
  const caption = photo.caption[locale];

  return (
    <div className="gallery-item">
      <AdminGalleryItemControls photo={photo} locale={locale} />

      <ZoomableImage
        src={imageUrl(photo.image.path)}
        width={photo.image.width}
        height={photo.image.height}
        alt={caption}
        sizes="(max-width: 700px) 100vw, 340px"
      />
      <div className="chip">{caption}</div>
    </div>
  );
}
