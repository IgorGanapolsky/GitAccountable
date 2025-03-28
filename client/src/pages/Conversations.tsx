import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Conversation } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface ConversationsProps {
  userId?: number;
}

export default function Conversations({ userId }: ConversationsProps) {
  const [expandedConversation, setExpandedConversation] = useState<number | null>(null);
  
  const { data: conversations, isLoading, isError } = useQuery({
    queryKey: ['/api/conversations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json() as Promise<Conversation[]>;
    }
  });

  const toggleExpand = (id: number) => {
    if (expandedConversation === id) {
      setExpandedConversation(null);
    } else {
      setExpandedConversation(id);
    }
  };

  if (!userId) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Sign in Required</h2>
        <p>Please sign in to view your conversations</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Conversation History</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 bg-white dark:bg-gh-header">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">Failed to load conversations. Please try again.</p>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="p-4 bg-white dark:bg-gh-header overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">
                    Conversation {formatDate(conversation.timestamp)}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                  </span>
                </div>
                
                <div className={`space-y-3 ${expandedConversation === conversation.id ? '' : 'max-h-40 overflow-hidden relative'}`}>
                  {(conversation.messages || []).map((message: any, index: number) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] p-2 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-gh-blue bg-opacity-10 dark:bg-opacity-30 ml-auto' 
                            : 'bg-gh-light dark:bg-gh-dark'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {expandedConversation !== conversation.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gh-header to-transparent"></div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => toggleExpand(conversation.id)}
                >
                  {expandedConversation === conversation.id ? 'Show Less' : 'Show More'}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-sm mt-2">
              Start chatting with the GitHub Assistant using the chat panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}
