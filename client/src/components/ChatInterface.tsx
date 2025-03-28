import { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  isOpen: boolean;
  isMinimized: boolean;
  onToggle: () => void;
  onMinimize: () => void;
  onClose: () => void;
  userId?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatInterface({
  isOpen,
  isMinimized,
  onToggle,
  onMinimize,
  onClose,
  userId
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! How can I help you with your GitHub repositories today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !userId) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/chat", {
        userId,
        message: input
      });
      
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Failed to get response",
        description: "Could not connect to the assistant. Please try again.",
        variant: "destructive"
      });
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshGitHub = async () => {
    if (!userId) return;
    
    try {
      await apiRequest("POST", "/api/repositories/sync", { userId });
      
      toast({
        title: "GitHub data refreshed",
        description: "Your repositories have been synchronized.",
      });
      
      // Add system message
      const systemMessage: Message = {
        role: "assistant",
        content: "GitHub data has been refreshed! Ask me about your latest repositories and activity.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh GitHub data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative">
      {/* Mobile chat toggle button */}
      <button 
        onClick={onToggle}
        className="fixed md:hidden bottom-4 right-4 bg-gh-blue hover:bg-blue-600 transition-colors text-white rounded-full p-3 shadow-lg z-20"
      >
        <i className="ri-chat-1-line text-xl"></i>
      </button>
      
      {/* Chat panel */}
      <div 
        className={`
          ${isOpen ? 'flex' : 'hidden md:flex'} 
          fixed bottom-0 right-0 md:w-96 
          ${isMinimized ? 'h-[40px]' : 'h-[500px]'} 
          max-h-[75vh] bg-white dark:bg-gh-header 
          border border-gray-200 dark:border-gh-border 
          rounded-t-lg shadow-lg z-10 flex-col 
          transition-all duration-300
        `}
      >
        {/* Chat header */}
        <div className="p-3 border-b border-gray-200 dark:border-gh-border flex justify-between items-center bg-gh-light dark:bg-gh-dark rounded-t-lg">
          <h3 className="font-semibold">Accountability Assistant</h3>
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white h-8 w-8 p-0"
              onClick={onMinimize}
            >
              {isMinimized ? (
                <i className="ri-add-line"></i>
              ) : (
                <i className="ri-subtract-line"></i>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white h-8 w-8 p-0 md:hidden"
              onClick={onClose}
            >
              <i className="ri-close-line"></i>
            </Button>
          </div>
        </div>
        
        {/* Chat messages */}
        {!isMinimized && (
          <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full bg-gh-blue flex items-center justify-center text-white">
                      <i className="ri-robot-line"></i>
                    </div>
                  </div>
                )}
                <div 
                  className={`
                    conversation-bubble 
                    ${message.role === "user" 
                      ? "bg-gh-blue bg-opacity-10 dark:bg-opacity-30 rounded-lg p-3 text-sm" 
                      : "bg-gh-light dark:bg-gh-dark rounded-lg p-3 text-sm"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 ml-2">
                    {userId ? (
                      <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" 
                        alt="User" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <i className="ri-user-line"></i>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full bg-gh-blue flex items-center justify-center text-white">
                    <i className="ri-robot-line"></i>
                  </div>
                </div>
                <div className="conversation-bubble bg-gh-light dark:bg-gh-dark rounded-lg p-3 text-sm">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Chat input */}
        {!isMinimized && (
          <div className="p-3 border-t border-gray-200 dark:border-gh-border">
            <form className="flex items-center" onSubmit={handleSendMessage}>
              <Input
                type="text"
                placeholder="Ask me anything about your repositories..."
                className="flex-1 border border-gray-300 dark:border-gh-border dark:bg-gh-dark dark:text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gh-blue text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || !userId}
              />
              <Button 
                type="submit" 
                className="ml-2 bg-gh-blue hover:bg-blue-600 text-white rounded-md p-2"
                disabled={isLoading || !input.trim() || !userId}
              >
                <i className="ri-send-plane-fill"></i>
              </Button>
            </form>
            <Separator className="my-2" />
            <div className="flex text-xs text-gray-500 dark:text-gray-400 justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto text-xs hover:text-gh-blue flex items-center"
                onClick={handleRefreshGitHub}
                disabled={!userId}
              >
                <i className="ri-github-fill mr-1"></i>
                <span>Refresh GitHub data</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto text-xs hover:text-gh-blue flex items-center"
                disabled={true}
              >
                <i className="ri-settings-3-line mr-1"></i>
                <span>Chat preferences</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
