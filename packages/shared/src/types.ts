import { z } from 'zod';

/* ──────────────── Location ──────────────── */
export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Location = z.infer<typeof LocationSchema>;

/* ──────────────── User ──────────────── */
export interface User {
  id: string;
  nickname: string;
  avatarUrl: string;
  tags: string[];
  foodPreferences: string[];
  bio?: string;
  bentoLayout?: BentoLayout;
}

/* ──────────────── Bento Grid ──────────────── */
export interface BentoCard {
  id: string;
  type: 'photo' | 'text' | 'tag' | 'map' | 'stats' | 'music';
  span: 1 | 2; // column span
  content: Record<string, unknown>;
}

export interface BentoLayout {
  cards: BentoCard[];
}

/* ──────────────── User Intent ──────────────── */
export type Purpose = 'coffee_chat' | 'date' | 'meal' | 'drink';
export type Budget = '$' | '$$' | '$$$';

export interface UserIntent {
  id: string;
  userId: string;
  purpose: Purpose;
  budget: Budget;
  expiresAt: string;
  status: 'active' | 'expired' | 'fulfilled';
}

/* ──────────────── Invitation ──────────────── */
export type InvitationStatus =
  | 'pending'
  | 'declined'
  | 'expired'
  | 'accepted'
  | 'ai_matching'
  | 'selecting'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'no_show';

export interface Invitation {
  id: string;
  hostId: string;
  guestId: string | null;
  intentId: string;
  hostLocation: Location | null;
  hostAddress: string;
  guestLocation: Location | null;
  guestAddress: string;
  scheduledAt: string;
  status: InvitationStatus;
  aiResult: AIRecommendationResult | null;
  createdAt: string;
}

/* ──────────────── AI Recommendation ──────────────── */
export const CandidateSchema = z.object({
  venue_name: z.string(),
  address: z.string(),
  location: LocationSchema,
  type: z.enum(['organic', 'sponsored']),
  recommendation_reason: z.string(),
  estimated_cost: z.number(),
  best_for: z.array(z.string()),
  suggested_item: z.string(),
  imgUrl: z.string().optional(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

export const AIRecommendationResultSchema = z.object({
  midpoint_analysis: z.string(),
  candidates: z.array(CandidateSchema).min(1).max(5),
});
export type AIRecommendationResult = z.infer<typeof AIRecommendationResultSchema>;

/* ──────────────── AI Request Input ──────────────── */
export interface AIMatchInput {
  host: {
    location?: Location;
    address: string;
    profile: { tags: string[]; food_pref: string[] };
    purpose: string;
    budget: Budget;
  };
  guest: {
    location?: Location;
    address: string;
    profile: { tags: string[]; food_pref: string[] };
  };
  context: {
    time: string;
    purpose: string;
  };
}

/* ──────────────── Venue Selections ──────────────── */
export interface VenueSelection {
  invitationId: string;
  userId: string;
  candidateIndex: number;
}

/* ──────────────── Check-in ──────────────── */
export interface CheckIn {
  id: string;
  invitationId: string;
  userId: string;
  location: Location;
  checkedInAt: string;
  verified: boolean;
}

/* ──────────────── Track Point ──────────────── */
export interface TrackPoint {
  invitationId: string;
  userId: string;
  location: Location;
  recordedAt: string;
}
