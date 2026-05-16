import type { AppRoute } from "../types"

type LandingProps = {
  onNavigate: (path: AppRoute) => void
}

const gameModes = [
  {
    title: "Play Against Computer",
    description: "Start a single-player match against the computer.",
    path: "/computer",
  },
  {
    title: "Play with Local Friend",
    description: "Share same device and take turns with a friend.",
    path: "/local-friend",
  },
  {
    title: "Play Online With Friend",
    description: "Open the online friend mode screen.",
    path: "/online-friend",
  },
] as const

export function Landing({ onNavigate }: LandingProps) {
  return (
    <section className="mx-auto flex h-full max-w-5xl flex-col justify-center">
      <div className="mb-6 sm:mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-teal-700">
          Tick Tak
        </p>
        <h1 className="max-w-2xl text-3xl font-bold text-slate-950 sm:text-5xl">
          Choose how you want to play
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {gameModes.map((mode) => (
          <button
            className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-md sm:p-6"
            key={mode.path}
            onClick={() => onNavigate(mode.path)}
            type="button"
          >
            <span className="block text-lg font-semibold text-slate-950 sm:text-xl">{mode.title}</span>
            <span className="mt-2 block text-sm leading-5 text-slate-600 sm:leading-6">{mode.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
