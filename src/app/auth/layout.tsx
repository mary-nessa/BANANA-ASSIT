export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-6">
            {children}
          </div>
        </main>
     
  );
}
