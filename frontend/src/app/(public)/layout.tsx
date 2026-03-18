import Header from "@/components/sections/Header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-dot-pattern min-h-screen">
      <Header />
      {children}
    </div>
  );
}
