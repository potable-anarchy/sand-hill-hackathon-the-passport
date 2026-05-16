/**
 * Core types for The Passport.
 */

export type StampState = "held" | "unlocked" | "stamped" | "banked";

export type PassportItem = {
  id: string;
  experienceId: string;
  slot: string;
  state: StampState;
  alternates: string[]; // alternate experience IDs held in reserve
  photoUrl?: string; // set when redeemed via photo
  redeemedAt?: string; // ISO timestamp
};

export type StaffObservation = {
  id: string;
  text: string; // raw input
  structured: Record<string, string>; // AI-structured fields
  guestId: string;
  staffMember: string;
  capturedAt: string; // ISO
};

export type GuestProfile = {
  id: string;
  name: string;
  statedIntent: string[]; // 3 prompts answers
  observations: StaffObservation[];
  engagementTier?: "high" | "mid" | "stretch";
};

export type ChatMessage = {
  id: string;
  role: "concierge" | "guest";
  text: string;
  voiceUrl?: string; // URL to cached MP3 if available
  timestamp: string; // ISO
};

export type PassportState = {
  guest: GuestProfile;
  items: PassportItem[];
  photos: { id: string; url: string; itemId?: string; uploadedAt: string }[];
  messages: ChatMessage[];
  stampsEarned: number;
  stampsBanked: number;
};
