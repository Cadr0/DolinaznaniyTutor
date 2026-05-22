type AppSectionPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function AppSectionPage({ title, description, eyebrow }: AppSectionPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="rounded-[2rem] border border-[var(--card-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        {eyebrow ? (
          <span className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--accent)]">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 font-display text-3xl text-[var(--foreground-strong)]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">{description}</p>
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--card-border)] bg-[var(--background)] p-6 text-sm text-[var(--muted)]">
          Раздел появится на следующем этапе разработки.
        </div>
      </div>
    </section>
  );
}
