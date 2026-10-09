import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LUNARIS | CLPS Lunar Mission Browser', description: 'Explore NASA CLPS missions, scientific payloads and mission outcomes with an interactive original Moon model and traceable sources.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
