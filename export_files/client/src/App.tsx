import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatInterface from "./components/ChatInterface";
import InstallPWA from "./components/InstallPWA";
import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import Conversations from "./pages/Conversations";
import Settings from "./pages/Settings";
import NotFound from "@/pages/not-found";
import { User } from "@shared/schema";

function App() {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Mock login for this demo - in a real app, we'd use authentication
  useEffect(() => {
    // Set a mock user for demo purposes
    const demoUser: User = {
      id: 1,
      username: "sarahj",
      password: "", // Empty for security
      name: "Sarah Johnson",
      githubUsername: "sarahj",
      githubToken: "demo-token",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    };
    setCurrentUser(demoUser);
  }, []);

  // Get the page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/repositories":
        return "Repositories";
      case "/conversations":
        return "Conversations";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-gh-light dark:bg-gh-dark text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          user={currentUser}
          currentPath={location}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header 
            title={getPageTitle()} 
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <Switch>
              <Route path="/" component={() => <Dashboard userId={currentUser?.id} />} />
              <Route path="/repositories" component={() => <Repositories userId={currentUser?.id} />} />
              <Route path="/conversations" component={() => <Conversations userId={currentUser?.id} />} />
              <Route path="/settings" component={() => <Settings user={currentUser} onUpdate={setCurrentUser} />} />
              <Route component={NotFound} />
            </Switch>
          </main>
          
          {/* Chat Interface */}
          <ChatInterface 
            isOpen={isChatOpen}
            isMinimized={isChatMinimized}
            onToggle={() => setIsChatOpen(!isChatOpen)}
            onMinimize={() => setIsChatMinimized(!isChatMinimized)}
            onClose={() => setIsChatOpen(false)}
            userId={currentUser?.id}
          />
        </div>
      </div>
      <InstallPWA />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
