import { SectionNav } from "@/components/shell/SectionNav";
import { LIFE_NAV } from "@/components/shell/nav";

export default function MemoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl">
      <SectionNav items={LIFE_NAV} />
      {children}
    </div>
  );
}
