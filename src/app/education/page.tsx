import { VerticalTemplate } from '@/components/VerticalTemplate';

export default function EducationPage() {
  return (
    <VerticalTemplate
      vertical="education"
      badge="FOR SCHOOLS, UNIVERSITIES & STEM LABS"
      title="The reusable embedded systems lab."
      subtitle="Replace tangled breadboards and burnt components with rugged magnetic modules that reset between class periods in seconds."
      highlights={[
        {
          heading: 'Classroom 10-Pack & 25-Pack',
          body: 'Includes rugged storage trays, spare magnetic bridges, and institutional Studio seat codes.',
        },
        {
          heading: 'Browser-Only Lab Setup',
          body: 'Students compile, emulate, and flash via WebSerial directly from Chromebooks, Macs, or Windows PCs.',
        },
      ]}
      ctaLabel="Add Evaluation Big Kit"
    />
  );
}
