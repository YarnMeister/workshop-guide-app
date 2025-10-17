

#Static content naming conventions and constent design:

## 1) IDs and file names

**Pages**

* **ID:** `P01`, `P02`, `P03` …
* **Slug:** `welcome`, `setup`, `write-spec`
* **File:** `p01-welcome.tsx`, `p02-setup.tsx`
* **Route:** `/welcome`, `/setup`, `/write-spec`

**Steps (per page)**

* **ID:** `S01`, `S02`, `S03` …
* **Composite Step ID:** `P01S01`, `P01S02`
* Steps live inside the page component or a small `steps` array.

**Images**

* **Path:** `public/assets/p{NN}/{step?}/`
* **File:**

  * Image for a page (no step): `img-p01-01.png`, `img-p01-02.png`
  * Image for a step: `img-p01-s01-01.png`, `img-p01-s01-02.png`
* Always 2-digit numbering.

**Text labels**

* Titles, button text kept in code as constants so we can reference by ID:

  * `TITLE.P01 = "Welcome"`
  * `TITLE.P01S01 = "Enter your participant number"`

> Rule: **Never reuse or recycle IDs.** If you delete `P02S02`, keep the ID unused forever.

---

## 2) Minimal folder structure

```
src/
  pages/
    p01-welcome.tsx
    p02-setup.tsx
    p03-write-spec.tsx
  components/
    Step.tsx
    Breadcrumbs.tsx
  content/
    index.ts            // master index of pages and steps
public/
  assets/
    p01/
      img-p01-01.png
      s01/
        img-p01-s01-01.png
        img-p01-s01-02.png
    p02/
      s01/img-p02-s01-01.png
```

---

## 3) Content index (single source of truth)

```ts
// src/content/index.ts
export const PAGES = [
  { id: "P01", slug: "welcome", title: "Welcome", steps: ["P01S01", "P01S02"] },
  { id: "P02", slug: "setup", title: "Environment Setup", steps: ["P02S01"] },
  { id: "P03", slug: "write-spec", title: "Write Spec", steps: ["P03S01", "P03S02", "P03S03"] },
] as const;

export const STEPS: Record<string, {
  pageId: "P01"|"P02"|"P03";            // tighten as you add pages
  title: string;
  body: string;
  images?: string[];                    // relative to /public
  ctaLabel?: string;
  ctaHref?: string;
}> = {
  P01S01: {
    pageId: "P01",
    title: "Enter participant number",
    body: "Your number is on your name tag. Example: 104.",
    images: ["/assets/p01/s01/img-p01-s01-01.png"]
  },
  P01S02: {
    pageId: "P01",
    title: "Confirm workshop repo",
    body: "Open the GitHub link and star the repo."
  },
  // …and so on
};
```

---

## 4) Component usage (super light)

```tsx
// src/pages/p01-welcome.tsx
import { PAGES, STEPS } from "@/content";
import Step from "@/components/Step";

export default function P01Welcome() {
  const page = PAGES.find(p => p.id === "P01")!;
  return (
    <main>
      <h1>{page.title}</h1>
      {page.steps.map(stepId => (
        <Step key={stepId} {...STEPS[stepId]} />
      ))}
    </main>
  );
}
```

```tsx
// src/components/Step.tsx
type Props = {
  title: string; body: string; images?: string[]; ctaLabel?: string; ctaHref?: string;
};

export default function Step({ title, body, images, ctaLabel, ctaHref }: Props) {
  return (
    <section aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <h2>{title}</h2>
      <p>{body}</p>
      {images?.map((src) => <img key={src} src={src} alt={title} />)}
      {ctaLabel && <a href={ctaHref} className="btn">{ctaLabel}</a>}
    </section>
  );
}
```

---

## 5) Breadcrumbs use the same IDs

```tsx
// src/components/Breadcrumbs.tsx
import { PAGES } from "@/content";
import Link from "next/link";

export default function Breadcrumbs({ currentSlug }: { currentSlug: string }) {
  return (
    <nav aria-label="progress">
      <ol>
        {PAGES.map(p => (
          <li key={p.id} data-active={p.slug === currentSlug}>
            <Link href={`/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## 6) Rules an AI assistant must follow

1. **Do not invent IDs.** Use the next number in sequence. Pages: `P04`, Steps for that page: `P04S01`, `P04S02`.
2. **Do not rename or repurpose existing IDs, slugs, or files.** Create new ones if needed.
3. **When adding a page:**

   * Create `src/pages/pNN-slug.tsx`
   * Append to `PAGES` with `id`, `slug`, `title`, `steps: []`
   * Add new `PxxSyy` entries in `STEPS`
   * Create any images under `public/assets/pNN[/sYY]/` using the file pattern
4. **When adding a step:**

   * Add `PxxSyy` to `STEPS`
   * Append the step ID to that page’s `steps` array in `PAGES`
   * Place images at `public/assets/pNN/sYY/img-pNN-sYY-01.png` etc
5. **When editing text or images:**

   * Update only `STEPS[...]` fields or image files, do not change IDs
6. **Accessibility:**

   * Every image must have an `alt` based on the step title
   * Use ordered `h1` per page, `h2` per step
7. **Navigation order** is the order of `PAGES` and each page’s `steps` array.
8. **No dynamic content, no CMS, no runtime fetches.** All content lives in `content/index.ts` and `public/assets`.

---

## 7) Example: adding a new page with two steps

* New page: “Deploy”

  * IDs: `P04`, steps `P04S01`, `P04S02`
  * Files: `src/pages/p04-deploy.tsx`, images at:

    * `/public/assets/p04/s01/img-p04-s01-01.png`
    * `/public/assets/p04/s02/img-p04-s02-01.png`

---

