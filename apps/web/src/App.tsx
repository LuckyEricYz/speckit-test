import { Button } from "@repo/ui";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16">
        <p className="rounded-full bg-brand-light/30 px-4 py-1 text-sm font-medium text-brand-dark">Monorepo Playground</p>
        <h1 className="text-center text-4xl font-bold tracking-tight">apps/web powered by @repo/ui</h1>
        <p className="text-center text-lg text-slate-600">
          This page imports the shared <code>@repo/ui</code> Button component and reuses the centralized Tailwind theme.
        </p>
        <Button className="px-8 py-3 text-base font-semibold" variant="success">Hello from Repo!</Button>
      </div>
    </div>
  );
}

export default App;
