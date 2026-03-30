import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, HashRouter } from "react-router-dom";
import { useEffect, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Components
import Index from "./components/LandingPage/Index";
import AIChatBot from "./components/LandingPage/AIChatBot";
import Navbar from "./components/LandingPage/Navbar";

import NotFound from "./pages/NotFound";

// 1. Initialize QueryClient outside the component to prevent re-creations on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// 2. ScrollToTop Component (Must be a child of BrowserRouter)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Refresh GSAP to prevent "ghost" scroll heights from previous routes
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.refresh();
    }
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <HashRouter>
          {/* ScrollToTop is now correctly inside the Router context */}
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<Index />} />
            {/* AI Assistant gets a static Navbar that is always visible */}
            <Route path="/ai-assistant" element={
              <>
                <Navbar showLogo={true} />
                <AIChatBot />
              </>
            } />

            {/* Catch-all route */}
            < Route path="*" element={<NotFound />} />
          </Routes>

          {/* UI Notifications placed globally */}
          <Toaster />
          <Sonner />
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;