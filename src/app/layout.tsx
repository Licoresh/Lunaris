import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LUNARIS', description: 'Explore lunar south-pole terrain, illumination and candidate sites with NASA-derived map layers and an illustrative mission simulation.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
