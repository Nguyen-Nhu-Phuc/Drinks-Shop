import LegalPage from '@/components/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage
      titleKey="legal.terms"
      leadKey="legal.termsLead"
      paragraphs={[
        'legal.terms.p1',
        'legal.terms.p2',
        'legal.terms.p3',
        'legal.terms.p4',
      ]}
    />
  );
}
