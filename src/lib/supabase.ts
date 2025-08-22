import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { getEnvironment } from "./utils";

const nodeEnv = getEnvironment();

let supabaseUrl: string;
let supabaseAnonKey: string;

if (nodeEnv === "production") {
  supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
  supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
} else {
  supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_LOCAL_URL as string;
  supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_LOCAL_ANON_KEY as string;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set LOCAL/STAG/PROD URL and ANON KEY in your .env"
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default supabase;