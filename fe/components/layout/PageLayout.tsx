import { ReactNode } from "react";
import { Footer } from "@/components/footer";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default PageLayout;
