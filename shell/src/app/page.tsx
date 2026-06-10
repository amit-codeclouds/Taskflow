export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-neutral-100">Taskflow Shell</h1>
      <p className="mt-3 text-neutral-400">
        Phase 0 — MFE foundation. The Shell (Next.js · 3000) hosts the Task MFE
        (Next.js · 3001) and the Board MFE (Angular · 4200) via Module Federation.
      </p>
      <ul className="mt-6 list-disc pl-6 text-neutral-300">
        <li><a className="text-indigo-400 hover:underline" href="/tasks">/tasks — Task MFE (Next.js remote)</a></li>
        <li><a className="text-indigo-400 hover:underline" href="/board">/board — Board MFE (Angular remote)</a></li>
      </ul>
    </main>
  );
}
