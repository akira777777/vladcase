import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-display font-bold tracking-tighter text-white">
            VLAD<span className="text-accent">CASE</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-secondary">
            <Link href="#" className="hover:text-white transition-colors">Market</Link>
            <Link href="#" className="hover:text-white transition-colors">Inventory</Link>
            <Link href="#" className="hover:text-white transition-colors">Stats</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs text-secondary">Balance</span>
            <span className="text-sm font-bold text-white">$0.00</span>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-md font-bold text-sm hover:bg-accent transition-colors">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
