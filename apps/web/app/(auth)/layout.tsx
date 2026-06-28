import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="mb-10 text-center">
        <Link
          href="/"
          className="inline-block text-2xl font-bold uppercase tracking-[0.35em] text-white transition-opacity hover:opacity-80 sm:text-3xl"
        >
          GarageScene
        </Link>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">
          Where legends start from nothing
        </p>
      </div>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
