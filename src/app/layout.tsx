export const metadata = {
  title: "Smart Attendance — Admin Dashboard",
  description: "PID 12 / Group 24",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
