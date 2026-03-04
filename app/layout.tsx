import Providers from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Meta Passport",
  description: "AI Meta Passport Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#07070b",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}