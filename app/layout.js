export const metadata = {
  title: 'MLD Catalog Backend',
  description: 'API host',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}