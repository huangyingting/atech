import { VerticalTemplate } from '@/components/VerticalTemplate';

export default function LogosPage() {
  return (
    <VerticalTemplate
      vertical="custom-logos"
      badge="CUSTOM CO-BRANDED HARDWARE KITS"
      title="Your brand on the motherboard and magnetic enclosure."
      subtitle="Order custom silkscreened Atech motherboards and laser-etched module cases for developer conferences, executive gifts, and partner launches."
      highlights={[
        {
          heading: 'Custom Silkscreen & Boot Logo',
          body: 'Your company logo rendered on the PCB silkscreen and pre-flashed onto the 128×64 OLED boot animation.',
        },
        {
          heading: 'Low Minimum Order Quantity',
          body: 'Custom co-branded kits start at just 25 units with worldwide fulfillment.',
        },
      ]}
      ctaLabel="Order Sample Kit"
    />
  );
}
