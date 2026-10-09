import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LUNARIS | South Polar Mission Explorer', description: 'Explore lunar south-pole terrain, illumination and mission sites with an interactive planning map.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
