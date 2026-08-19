import LegalPage from '@/components/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage
      titleKey="legal.privacy"
      leadKey="legal.privacyLead"
      paragraphs={[
        'legal.privacy.p1',
        'legal.privacy.p2',
        'legal.privacy.p3',
        'legal.privacy.p4',
      ]}
    />
  );
}
