import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300">
          MVP · Next.js + PostgreSQL + Docker
        </span>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Долина знаний
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-slate-300">
          Платформа для репетиторов: комнаты для учеников, задания, проверка
          домашней работы и маркетплейс материалов.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/api/health"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium hover:bg-emerald-500"
          >
            API Health
          </Link>
          <Link
            href="/api/version"
            className="rounded-lg border border-slate-600 px-5 py-2.5 hover:border-slate-400"
          >
            Версия
          </Link>
          <a
            href="https://github.com/Cadr0/DolinaznaniyTutor"
            className="rounded-lg border border-slate-600 px-5 py-2.5 hover:border-slate-400"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
        <ul className="mt-12 grid gap-3 text-left text-sm text-slate-400 sm:grid-cols-3">
          <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            Репетитор — комнаты и ученики
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            Ученик — задания и прогресс
          </li>
          <li className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            Маркетплейс — каталог заданий
          </li>
        </ul>
      </div>
    </main>
  );
}
