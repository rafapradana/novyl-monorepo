import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-indigo-600">
            Novyl
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
