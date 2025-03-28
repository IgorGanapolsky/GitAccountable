import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useChat(userId?: number) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome! How can I help you with your GitHub repositories today?",
      timestamp: new Date()
    }
  ]);
  const { toast } = useToast();
  
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!userId) throw new Error("User ID is required");
      return apiRequest("POST", "/api/chat", { userId, message });
    },
    onSuccess: async (response, message) => {
      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Failed to get response",
        description: error.message || "Could not connect to the assistant",
        variant: "destructive"
      });
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  });
  
  const sendMessage = (message: string) => {
    if (!message.trim() || !userId || chatMutation.isPending) return;
    
    // Add user message to chat
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to API
    chatMutation.mutate(message);
  };
  
  return {
    messages,
    isLoading: chatMutation.isPending,
    sendMessage,
    clearMessages: () => setMessages([{
      role: "assistant",
      content: "Welcome! How can I help you with your GitHub repositories today?",
      timestamp: new Date()
    }])
  };
}
