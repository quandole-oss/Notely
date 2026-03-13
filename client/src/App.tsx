import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BottomNav from "./components/BottomNav";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Practice from "./pages/Practice";
import Progress from "./pages/Progress";
import SkillTree from "./pages/SkillTree";

// Pages that show the bottom nav
const PAGES_WITH_NAV = ["/dashboard", "/practice", "/progress", "/skill-tree"];

function AppLayout() {
  const [location] = useLocation();
  const showNav = PAGES_WITH_NAV.some((p) => location.startsWith(p)) || location.startsWith("/lesson");

  return (
    <>
      <div style={{ paddingBottom: showNav ? "4.5rem" : 0 }}>
        <Switch>
          <Route path="/" component={Onboarding} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/lesson/:id" component={Lesson} />
          <Route path="/practice" component={Practice} />
          <Route path="/progress" component={Progress} />
          <Route path="/skill-tree" component={SkillTree} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {showNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
