import PlatformNav from "@/components/PlatformNav";
import PlatformFooter from "@/components/PlatformFooter";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (<><PlatformNav />{children}<PlatformFooter /></>);
}
