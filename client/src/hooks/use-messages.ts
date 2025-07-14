import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export function useMessages() {
  const { user } = useAuth();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = messages?.filter((message: any) => 
    !message.isRead && message.toUserId === user?.id
  ).length || 0;

  return {
    messages,
    isLoading,
    unreadCount,
  };
}