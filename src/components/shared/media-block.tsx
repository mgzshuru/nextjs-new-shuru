import Image from "next/image";
import { extractMediaUrl, toAbsoluteUrl, type FullStrapiMedia } from "@/lib/strapi";

type MediaBlockProps = {
  block: {
    __component: "shared.media";
    id: number;
    file?: FullStrapiMedia;
  };
};

export function MediaBlock({ block }: MediaBlockProps) {
  if (!block.file) return null;

  const url = toAbsoluteUrl(extractMediaUrl(block.file));
  if (!url) return null;
  const isVideo = block.file.mime?.startsWith("video/");

  return (
    <section className="my-12 max-w-5xl mx-auto px-4 w-full">
      <div className="relative overflow-hidden rounded-2xl bg-muted w-full aspect-video border shadow-sm">
        {isVideo ? (
          <video
            src={url}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          />
        ) : (
          <Image
            src={url}
            alt={block.file.alternativeText || "Media"}
            fill
            className="object-cover w-full h-full"
          />
        )}
      </div>
    </section>
  );
}
