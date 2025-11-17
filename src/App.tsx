import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Preloader } from "@/components/Preloader";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import { RouteLoader } from "@/components/RouteLoader";

// Lazy load all pages for code-splitting and better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const Exams = lazy(() => import("./pages/Exams"));
const Library = lazy(() => import("./pages/Library"));
const Campus = lazy(() => import("./pages/Campus"));
const Store = lazy(() => import("./pages/Store"));
const AITutor = lazy(() => import("./pages/AITutor"));
const ProjectWriter = lazy(() => import("./pages/ProjectWriter"));
const StudyRoom = lazy(() => import("./pages/StudyRoom"));
const ISeek = lazy(() => import("./pages/ISeek"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Inner app component that has access to loading context
const InnerApp = () => {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <>
      <Preloader isLoading={isLoading} message={loadingMessage} />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div />}>
          <RouteLoader>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/library" element={<Library />} />
              <Route path="/campus" element={<Campus />} />
              <Route path="/store" element={<Store />} />
              <Route path="/ai-tutor" element={<AITutor />} />
              <Route path="/project-writer" element={<ProjectWriter />} />
              <Route path="/study-room" element={<StudyRoom />} />
              <Route path="/seek" element={<ISeek />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteLoader>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <LoadingProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InnerApp />
      </TooltipProvider>
    </QueryClientProvider>
  </LoadingProvider>
);

export default App;
