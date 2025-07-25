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
}