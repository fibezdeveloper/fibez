import FeatureGate from '@/components/FeatureGate';

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate page="tickets" name="Support tickets">
      {children}
    </FeatureGate>
  );
}
