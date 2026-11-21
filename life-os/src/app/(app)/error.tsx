"use client";
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-sm font-medium">Something went wrong loading this page.</p>
      <p className="mt-1 text-sm text-muted">Your data is safe. Try again, or come back in a moment.</p>
      <button onClick={reset} className="mt-4 text-sm text-accent hover:underline">Try again</button>
    </div>
  );
}
