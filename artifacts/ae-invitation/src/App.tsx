import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FrontPage from "@/components/frontpage/FrontPage";
import ClientPage from "@/pages/client";
import TalentPage from "@/pages/talent";
import LandingRoute from "@/pages/landing";
import BookPage from "@/pages/book";
import PreviewPage from "@/pages/preview";
import LoginPage from "@/pages/admin/login";
import AdminHome from "@/pages/admin/index";
import NewPage from "@/pages/admin/new";
import LeadsPage from "@/pages/admin/leads";
import FrontPageEditPage from "@/pages/admin/frontpage";
import EditPage from "@/pages/admin/edit";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={FrontPage} />
      <Route path="/client" component={ClientPage} />
      <Route path="/talent" component={TalentPage} />
      <Route path="/admin/login" component={LoginPage} />
      <Route path="/admin/new" component={NewPage} />
      <Route path="/admin/leads" component={LeadsPage} />
      <Route path="/admin/frontpage" component={FrontPageEditPage} />
      <Route path="/admin" component={AdminHome} />
      <Route path="/admin/:slug" component={EditPage} />
      <Route path="/book/:slug" component={BookPage} />
      <Route path="/preview/:slug" component={PreviewPage} />
      <Route path="/:slug" component={LandingRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
