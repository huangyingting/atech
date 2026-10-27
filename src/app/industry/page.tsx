import { VerticalTemplate } from '@/components/VerticalTemplate';

export default function IndustryPage() {
  return (
    <VerticalTemplate
      vertical="industry"
      badge="FOR R&D & PRODUCT ENGINEERING TEAMS"
      title="Validate physical UX and sensor fusion in an afternoon."
      subtitle="Test physical knobs, OLED telemetry, IMU gestures, and HTTP webhook pipelines with stakeholders before committing to custom PCBs."
      highlights={[
        {
          heading: 'Deterministic C++ Export',
          body: 'Export clean, dependency-free ESP32-S3 firmware sketches and complete JSON hardware manifests.',
        },
        {
          heading: 'WiFi & Webhook Integration',
          body: 'Stream live telemetry into internal REST endpoints, MQTT brokers, or cloud dashboards out of the box.',
        },
      ]}
      ctaLabel="Order Engineering Kit"
    />
  );
}
