import { CASES } from '@/data/mockData';
import CaseOpenPage from '@/components/case/CaseOpenPage';

export function generateStaticParams() { return CASES.map((c) => ({ caseId: c.id })); }

export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const c = CASES.find((e) => e.id === caseId);
  return { title: c ? `${c.name} — VLADCASE` : 'Case', description: c?.description ?? 'VLADCASE case.' };
}

export default async function Page({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <CaseOpenPage caseId={caseId} />;
}