import type { MetadataRoute } from 'next';
import { CASES } from '@/data/mockData';

const base = 'https://vladcase.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/inventory`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/upgrade`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/stats`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/history`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/contracts`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/settings`, changeFrequency: 'monthly', priority: 0.3 },
    ...CASES.map((caseItem) => ({ url: `${base}/cases/${caseItem.id}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
