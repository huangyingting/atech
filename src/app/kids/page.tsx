import { VerticalTemplate } from '@/components/VerticalTemplate';

export default function KidsPage() {
  return (
    <VerticalTemplate
      vertical="kids"
      badge="FOR YOUNG INVENTORS & FAMILIES"
      title="Real electronics. Zero soldering. Endless invention."
      subtitle="Kids snap magnetic displays, buttons, and motion sensors onto the board and describe their game or gadget in plain English."
      highlights={[
        {
          heading: '100% Safe Magnetic Ports',
          body: 'Low-voltage 3.3V current-limited pogo pins mean modules can be snapped in any direction without short circuits.',
        },
        {
          heading: 'Learn Real C++ & Physics',
          body: 'Start with Simple English prompts in Studio and switch to Advanced mode anytime to inspect the real ESP32-S3 C++ code.',
        },
      ]}
      ctaLabel="Order Family Big Kit"
    />
  );
}
