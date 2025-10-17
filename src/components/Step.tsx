import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  body: string;
  images?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function Step({ title, body, images, ctaLabel, ctaHref }: Props) {
  return (
    <section aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()} className="mb-10">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">{body}</p>
      {images?.map((src, i) => (
        <figure key={src} className="mb-4 overflow-hidden rounded-xl border bg-muted/30">
          <img src={src} alt={title} className="w-full" />
          <figcaption className="px-4 py-2 text-xs text-muted-foreground">Image {i + 1}</figcaption>
        </figure>
      ))}
      {ctaLabel && ctaHref && (
        <Button asChild className="mt-2">
          <a href={ctaHref}>{ctaLabel}</a>
        </Button>
      )}
    </section>
  );
}


