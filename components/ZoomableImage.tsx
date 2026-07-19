'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
};

/**
 * Photo that opens full size in a <dialog> on click, replacing the lightbox that
 * app.js used to wire up over every `.post-media img` / `.gallery-item img`.
 */
export default function ZoomableImage({ src, alt, width, height, sizes, priority }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function show() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <Image
        className="zoomable"
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        onClick={show}
      />
      <dialog
        className="lightbox"
        ref={dialogRef}
        onClick={() => dialogRef.current?.close()}
        onClose={() => setOpen(false)}
      >
        {/* Full-resolution original: next/image would re-optimise a view that wants max detail. */}
        {open ? <img src={src} alt={alt} decoding="async" /> : null}
      </dialog>
    </>
  );
}
