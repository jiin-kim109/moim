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
  auth_id: string | null;
  is_onboarded: boolean;
  address?: Address | null;
}

export interface ChatRoomParticipant {
  user_id: string;
  nickname: string | null;
  joined_at: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  max_participants: number | null;
  created_at: string;
  host: UserProfile | null;
  participant_count: number;
  address: Address | null;
  participants: ChatRoomParticipant[];
}

export interface ChatMessage {
  id: string;
  chatroom_id: string;
  sender_id: string;
  message: string;
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  sender: UserProfile;
  sender_nickname: string;
}