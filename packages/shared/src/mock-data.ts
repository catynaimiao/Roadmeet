import type {
  User,
  Invitation,
  AIRecommendationResult,
  TrackPoint,
  UserIntent,
  Candidate,
} from './types';

/* ──────────────── Mock Users ──────────────── */
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    nickname: '小林',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
    tags: ['Tech', 'Chill', '咖啡爱好者'],
    foodPreferences: ['不吃辣', '偏日料'],
    bio: '产品经理 / 业余摄影 / 精品咖啡',
    bentoLayout: {
      cards: [
        {
          id: 'b1', type: 'photo', span: 2,
          content: { url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', caption: '最爱的咖啡店' },
        },
        {
          id: 'b2', type: 'text', span: 1,
          content: { text: '寻找有趣的灵魂一起喝咖啡 ☕️' },
        },
        {
          id: 'b3', type: 'stats', span: 1,
          content: { label: '约饭次数', value: '23' },
        },
        {
          id: 'b4', type: 'photo', span: 1,
          content: { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', caption: '上周探店' },
        },
        {
          id: 'b5', type: 'tag', span: 1,
          content: { tags: ['Tech', 'Chill', '咖啡爱好者', '日料'] },
        },
      ],
    },
  },
  {
    id: 'u2',
    nickname: '阿瑜',
    avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
    tags: ['Designer', '美食猎人', '会开车'],
    foodPreferences: ['无忌口'],
    bio: 'UI 设计师 / 探店博主',
    bentoLayout: {
      cards: [
        {
          id: 'b1', type: 'photo', span: 2,
          content: { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', caption: '周末打卡' },
        },
        {
          id: 'b2', type: 'text', span: 1,
          content: { text: '吃货一枚，约饭找我准没错 🍜' },
        },
        {
          id: 'b3', type: 'stats', span: 1,
          content: { label: '探店数', value: '47' },
        },
      ],
    },
  },
];

/* ──────────────── Mock Intents ──────────────── */
export const MOCK_INTENTS: UserIntent[] = [
  {
    id: 'i1',
    userId: 'u1',
    purpose: 'coffee_chat',
    budget: '$$',
    expiresAt: '2026-02-15T00:00:00Z',
    status: 'active',
  },
  {
    id: 'i2',
    userId: 'u2',
    purpose: 'meal',
    budget: '$$',
    expiresAt: '2026-02-14T00:00:00Z',
    status: 'active',
  },
];

/* ──────────────── Mock AI Candidates ──────────────── */
export const MOCK_CANDIDATES: Candidate[] = [
  {
    venue_name: 'Seesaw Coffee (Réel Mall)',
    address: '南京西路 1601 号',
    location: { lat: 31.2230, lng: 121.4650 },
    type: 'organic',
    recommendation_reason: '位于你们两人的地理中心，环境开阔适合 Coffee Chat，设计感空间很适合创意碰撞。',
    estimated_cost: 45,
    best_for: ['Work', 'Chat'],
    suggested_item: '燕麦拿铁',
    imgUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  },
  {
    venue_name: 'M Stand (新天地)',
    address: '马当路 245 号',
    location: { lat: 31.2180, lng: 121.4730 },
    type: 'organic',
    recommendation_reason: '新天地商圈核心位置，距离双方均 15 分钟内到达，暗黑工业风适合轻松聊天。',
    estimated_cost: 52,
    best_for: ['Date', 'Chat'],
    suggested_item: '椰子拿铁 + 可颂',
    imgUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
  },
  {
    venue_name: '% Arabica (武康路)',
    address: '武康路 378 号',
    location: { lat: 31.2100, lng: 121.4380 },
    type: 'organic',
    recommendation_reason: '武康路经典地标，拍照打卡圣地。适合边走边聊的 Coffee Chat 场景。',
    estimated_cost: 38,
    best_for: ['Walk', 'Photo'],
    suggested_item: '西班牙拿铁',
    imgUrl: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&q=80',
  },
];

/* ──────────────── Mock AI Result ──────────────── */
export const MOCK_AI_RESULT: AIRecommendationResult = {
  midpoint_analysis:
    '检测到两人分别位于静安区（南京西路）和徐汇区（漕溪路），中心点靠近淮海中路一带。当前为周六下午，推荐该区域适合 Coffee Chat 的场所。',
  candidates: MOCK_CANDIDATES,
};

/* ──────────────── Mock Invitations ──────────────── */
export const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 'inv1',
    hostId: 'u1',
    guestId: 'u2',
    intentId: 'i1',
    hostLocation: { lat: 31.2304, lng: 121.4737 },
    hostAddress: '南京西路 1601 号',
    guestLocation: { lat: 31.2000, lng: 121.4500 },
    guestAddress: '漕溪北路 331 号',
    scheduledAt: '2026-02-14T14:00:00Z',
    status: 'selecting',
    aiResult: MOCK_AI_RESULT,
    createdAt: '2026-02-11T10:00:00Z',
  },
];

/* ──────────────── Mock Track Data ──────────────── */
export const MOCK_TRACK_POINTS: TrackPoint[] = [
  // Host route (u1)
  { invitationId: 'inv1', userId: 'u1', location: { lat: 31.2304, lng: 121.4737 }, recordedAt: '2026-02-14T13:30:00Z' },
  { invitationId: 'inv1', userId: 'u1', location: { lat: 31.2280, lng: 121.4720 }, recordedAt: '2026-02-14T13:35:00Z' },
  { invitationId: 'inv1', userId: 'u1', location: { lat: 31.2260, lng: 121.4700 }, recordedAt: '2026-02-14T13:40:00Z' },
  { invitationId: 'inv1', userId: 'u1', location: { lat: 31.2240, lng: 121.4680 }, recordedAt: '2026-02-14T13:45:00Z' },
  { invitationId: 'inv1', userId: 'u1', location: { lat: 31.2230, lng: 121.4650 }, recordedAt: '2026-02-14T13:50:00Z' },
  // Guest route (u2)
  { invitationId: 'inv1', userId: 'u2', location: { lat: 31.2000, lng: 121.4500 }, recordedAt: '2026-02-14T13:30:00Z' },
  { invitationId: 'inv1', userId: 'u2', location: { lat: 31.2060, lng: 121.4530 }, recordedAt: '2026-02-14T13:35:00Z' },
  { invitationId: 'inv1', userId: 'u2', location: { lat: 31.2120, lng: 121.4560 }, recordedAt: '2026-02-14T13:40:00Z' },
  { invitationId: 'inv1', userId: 'u2', location: { lat: 31.2180, lng: 121.4600 }, recordedAt: '2026-02-14T13:45:00Z' },
  { invitationId: 'inv1', userId: 'u2', location: { lat: 31.2230, lng: 121.4650 }, recordedAt: '2026-02-14T13:50:00Z' },
];

/* ──────────────── Mock Venue Spots (for profile) ──────────────── */
export const MOCK_FAVORITE_SPOTS = [
  {
    name: '武康路',
    category: '咖啡街区',
    imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&q=80',
    location: { lat: 31.2100, lng: 121.4380 },
  },
  {
    name: '外白渡桥',
    category: '地标建筑',
    imageUrl: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=400&q=80',
    location: { lat: 31.2450, lng: 121.4900 },
  },
  {
    name: '思南公馆',
    category: '历史街区',
    imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&q=80',
    location: { lat: 31.2170, lng: 121.4700 },
  },
];

export const MOCK_USER_TAGS = [
  { emoji: '😐', label: '淡淡i人' },
  { emoji: '👩‍💼', label: '工作党' },
  { emoji: '🚗', label: '会开车' },
  { emoji: '🧭', label: '方向感强' },
];
