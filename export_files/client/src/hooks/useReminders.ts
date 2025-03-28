import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Reminder, InsertReminder } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useReminders(userId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Query reminders
  const {
    data: reminders,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/reminders', userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/reminders?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch reminders");
      return response.json() as Promise<Reminder[]>;
    }
  });
  
  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: InsertReminder) => {
      return apiRequest("POST", "/api/reminders", reminderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', userId] });
      toast({
        title: "Reminder created",
        description: "Your reminder has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create reminder",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });
  
  // Update reminder mutation
  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertReminder> }) => {
      return apiRequest("PATCH", `/api/reminders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', userId] });
      toast({
        title: "Reminder updated",
        description: "Your reminder has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update reminder",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });
  
  // Delete reminder mutation
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/reminders/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders', userId] });
      toast({
        title: "Reminder deleted",
        description: "Your reminder has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete reminder",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });
  
  // Complete a reminder
  const completeReminder = (reminderId: number) => {
    updateReminderMutation.mutate({ 
      id: reminderId, 
      data: { completed: true } 
    });
  };
  
  // Snooze a reminder for one day
  const snoozeReminder = (reminderId: number) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    updateReminderMutation.mutate({ 
      id: reminderId, 
      data: { dueDate: tomorrow } 
    });
  };
  
  return {
    reminders,
    isLoading,
    isError,
    refetch,
    createReminder: (data: InsertReminder) => createReminderMutation.mutate(data),
    updateReminder: (id: number, data: Partial<InsertReminder>) => 
      updateReminderMutation.mutate({ id, data }),
    deleteReminder: (id: number) => deleteReminderMutation.mutate(id),
    completeReminder,
    snoozeReminder,
    isCreating: createReminderMutation.isPending,
    isUpdating: updateReminderMutation.isPending,
    isDeleting: deleteReminderMutation.isPending
  };
}
