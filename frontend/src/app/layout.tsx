import "./globals.css";

export const metadata = {
  title: "AI Research Dashboard",
  description: "Institutional-grade AI-powered research platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}