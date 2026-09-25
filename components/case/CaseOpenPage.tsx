'use client';

import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { CASES } from '@/data/mockData';
import PriceTag from '@/components/ui/PriceTag';

export default function CaseOpenPage({ caseId }: { caseId: string }) {
  const caseItem = CASES.find((c) => c.id === caseId);

  if (!caseItem) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-black text-white">Case not found</h1>
        <p className="mt-2 text-text-secondary text-sm">The case &quot;{caseId}&quot; is not in our catalog.</p>
        <Link href="/" className="mt-6 inline-flex btn-primary">Back to cases</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white mb-3">
            <ArrowLeft className="h-4 w-4" />Back to cases
          </Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-300">{caseItem.category} case</p>
          <h1 className="mt-1 text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tighter uppercase leading-none">{caseItem.name}</h1>
          {caseItem.description && <p className="mt-2 text-xs text-text-secondary max-w-2xl">{caseItem.description}</p>}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 border border-brand/30">
          <PriceTag value={caseItem.price} variant="default" size="md" prefix="Per open" />
          <button type="button" onClick={() => window.alert('Open the case from the catalog grid for the full open animation experience.')} className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-white">
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>
    </div>
  );
}