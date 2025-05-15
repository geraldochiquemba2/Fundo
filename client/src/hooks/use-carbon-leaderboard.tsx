import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useCarbonLeaderboard(period: string = 'all_time') {
  const { toast } = useToast();

  const { 
    data: leaderboard, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/carbon-leaderboard', period],
    enabled: true,
  });

  const updateCompanyCarbonStatsMutation = useMutation({
    mutationFn: async ({ companyId, data }: { companyId: number, data: any }) => {
      const response = await fetch(`/api/companies/${companyId}/carbon-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar estatísticas de carbono');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Dados atualizados",
        description: "Suas estatísticas de pegada de carbono foram atualizadas com sucesso.",
      });
      
      // Invalidar a consulta do leaderboard para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carbon-leaderboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar dados",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recalculateRankingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/carbon-leaderboard/recalculate', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao recalcular ranking');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ranking recalculado",
        description: "O ranking de pegada de carbono foi recalculado com sucesso.",
      });
      
      // Invalidar a consulta do leaderboard para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ['/api/carbon-leaderboard'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao recalcular ranking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    leaderboard,
    isLoading,
    error,
    updateCompanyCarbonStats: updateCompanyCarbonStatsMutation.mutate,
    isUpdating: updateCompanyCarbonStatsMutation.isPending,
    recalculateRanking: recalculateRankingMutation.mutate,
    isRecalculating: recalculateRankingMutation.isPending,
  };
}

export function useCompanyCarbonStats(companyId: number) {
  const { 
    data: stats, 
    isLoading,
    error 
  } = useQuery({
    queryKey: [`/api/companies/${companyId}/carbon-stats`],
    enabled: !!companyId,
  });

  return {
    stats,
    isLoading,
    error,
  };
}