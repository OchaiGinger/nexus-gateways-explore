import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Exams from "./pages/Exams";
import Library from "./pages/Library";
import Campus from "./pages/Campus";
import Store from "./pages/Store";
import AITutor from "./pages/AITutor";
import ProjectWriter from "./pages/ProjectWriter";
import StudyRoom from "./pages/StudyRoom";
import ISeek from "./pages/ISeek";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/ai-tutor/classroom/:classroomId" element={<AITutor />} />
          <Route path="/project-writer" element={<ProjectWriter />} />
          <Route path="/study-room" element={<StudyRoom />} />
          <Route path="/seek" element={<ISeek />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
