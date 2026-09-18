import React from 'react';
import Navbar from '@/components/ui/Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/30">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-secondary text-sm">
          © {new Date().getFullYear()} VLADCASE. Virtual economy simulator.
        </div>
      </footer>
    </div>
  );
}
