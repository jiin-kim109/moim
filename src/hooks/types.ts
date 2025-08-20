export type Address = {
  place_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
};

export interface UserProfile {
  id: string;
  username: string;
  is_onboarded: boolean;
  neighborhood_distance_km: number;
  address?: Address | null;
  notification_enabled: boolean;
}

export interface ChatRoomParticipant {
  user_id: string;
  nickname: string | null;
  joined_at: string;
  profile_image_url?: string | null;
}

export interface ChatRoom {
  id: string;
  title: string;
  host_id: string;
  description: string | null;
  thumbnail_url: string | null;
  max_participants: number | null;
  created_at: string;
  participant_count: number;
  address: Address | null;
  latest_message_id: string | null;
  latest_message: ChatMessage | null;
}

export interface ChatMessage {
  id: string;
  chatroom_id: string;
  sender_id: string;
  message: string;
  message_type: 'user_message' | 'system_message';
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  unread_count: number;
  sender_info: ChatRoomParticipant;
}

export type ReportType = 'chatroom' | 'message' | 'user';

export type Report = {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  reason: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type BannedUser = {
  id: string;
  chatroom_id: string;
  user_id: string;
  nickname: string;
  profile_image_url: string | null;
  banned_at: string;
};
