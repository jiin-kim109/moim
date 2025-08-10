import {
  useInfiniteQuery,
  QueryClient,
} from "@tanstack/react-query";
import supabase from '../../lib/supabase';
import { ChatRoom } from '../types';

export type RecommendedChatroomsError = {
  message: string;
  code?: string;
};

export type RecommendedChatroomsPage = {
  chatrooms: ChatRoom[];
  nextPage?: number;
  hasMore: boolean;
};

const PAGE_SIZE = 20;

export const fetchRecommendedChatrooms = async (
  userId: string,
  pageNumber: number = 1
): Promise<RecommendedChatroomsPage> => {
  if (!userId) {
    return {
      chatrooms: [],
      hasMore: false,
    };
  }

  const { data, error } = await supabase.rpc('get_chatrooms_by_location', {
    user_id: userId,
    page_size: PAGE_SIZE,
    page_number: pageNumber
  });

  if (error) {
    throw new Error(`Failed to fetch recommended chatrooms: ${error.message}`);
  }

  const chatrooms = (data || []).map((item: any) => ({
    ...item,
    participant_count: parseInt(item.participant_count) || 0,
    distance_km: parseFloat(item.distance_km) || 0,
  }));

  const hasMore = chatrooms.length === PAGE_SIZE;
  const nextPage = hasMore ? pageNumber + 1 : undefined;

  return {
    chatrooms,
    nextPage,
    hasMore,
  };
};

export function useGetRecommendedChatrooms(
  userId: string,
  queryOptions?: any,
) {
  return useInfiniteQuery({
    queryKey: ["recommendedChatrooms", userId],
    queryFn: ({ pageParam }) => fetchRecommendedChatrooms(userId, pageParam as number || 1),
    enabled: !!userId,
    getNextPageParam: (lastPage: RecommendedChatroomsPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
    ...queryOptions,
  });
}

export const prefetchRecommendedChatrooms = async (
  queryClient: QueryClient,
  userId: string
) => {
  if (!userId) return;
  
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["recommendedChatrooms", userId],
    queryFn: ({ pageParam }) => fetchRecommendedChatrooms(userId, pageParam as number || 1),
    initialPageParam: 1,
  });
}; 