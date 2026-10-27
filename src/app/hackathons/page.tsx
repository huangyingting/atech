import { VerticalTemplate } from '@/components/VerticalTemplate';

export default function HackathonsPage() {
  return (
    <VerticalTemplate
      vertical="hackathons"
      badge="FOR HARDWARE HACKATHONS & MAKERSPACES"
      title="Hardware tracks where every team demos a working build."
      subtitle="Eliminate soldering bottlenecks and missing drivers so hackathon teams can focus on product creativity and full-stack hardware integration."
      highlights={[
        {
          heading: '24-Hour Turnaround',
          body: 'Teams go from idea to interactive 3D assembly and flashed ESP32-S3 hardware in under 15 minutes.',
        },
        {
          heading: 'Community Hub Showcase',
          body: 'Participants publish their builds to the Atech Community Hub for instant 1-click judge testing.',
        },
      ]}
      ctaLabel="Get Hackathon Sample Kit"
    />
  );
}
