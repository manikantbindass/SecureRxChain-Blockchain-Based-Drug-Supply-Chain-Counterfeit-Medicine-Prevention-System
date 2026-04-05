import { cn } from "../../utils/utils";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      {/* Abstract Texture elements to prevent flatness */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,black_1px,transparent_1px)] [background-size:32px_32px]"></div>
      </div>
      
      {/* Radial glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent blur-[150px] opacity-[0.04] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-secondary blur-[150px] opacity-[0.03] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default Layout;
