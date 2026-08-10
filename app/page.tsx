import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight">EquiVault</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          AI-powered bearing document analysis and comparison. Upload datasheets,
          extract specifications, and verify part compatibility.
        </p>
        <Link
          href="/upload"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-primary-foreground font-medium transition-colors hover:bg-primary/80"
        >
          Compare Bearings
        </Link>
      </main>
    </div>
  );
}
