'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu, Utensils, User, Plus, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MOCK_USERS,
  MOCK_FAVORITE_SPOTS,
} from '@eatwhat/shared';

const MapView = dynamic(
  () => import('@/components/map-view').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted" /> }
);

const currentUser = MOCK_USERS[0];

/* ─── Decorative food cards data ─── */
const FOOD_CARDS = [
  {
    emoji: '🍜',
    title: '热门美食',
    count: 28,
    label: '地点',
    bg: 'from-amber-100 to-yellow-50',
    rotate: '-rotate-6',
  },
  {
    emoji: '☕',
    title: '咖啡探店',
    count: 12,
    label: '推荐',
    bg: 'from-blue-100 to-sky-50',
    rotate: 'rotate-6',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      {/* ─── Floating header over map ─── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-3 pb-2">
        <div className="size-11 rounded-full bg-background shadow-md flex items-center justify-center">
          <Utensils className="size-5 text-foreground" />
        </div>
        <Link href="/settings">
          <div className="size-11 rounded-full bg-background shadow-md flex items-center justify-center">
            <Menu className="size-5 text-foreground" />
          </div>
        </Link>
      </header>

      {/* ─── Map (fills top half) ─── */}
      <div className="w-full" style={{ height: '55dvh' }}>
        <MapView
          center={[31.2304, 121.4737]}
          zoom={11}
          markers={MOCK_FAVORITE_SPOTS.map((s, i) => ({
            position: [s.location.lat, s.location.lng] as [number, number],
            label: `${i + 1}`,
            color: '#3b82f6',
          }))}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* ─── Bottom Sheet ─── */}
      <div className="flex-1 -mt-6 relative z-10">
        <div className="bg-background rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-4">
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
          </div>

          <div className="px-6 pb-32">
            {/* ─── Decorative Card Stack ─── */}
            <div className="flex justify-center items-center mb-6">
              <div className="relative w-64 h-44">
                {/* Card 1 (behind, rotated left) */}
                <div className={`absolute left-2 top-2 w-36 h-40 rounded-2xl bg-gradient-to-br ${FOOD_CARDS[0].bg} p-4 ${FOOD_CARDS[0].rotate} shadow-lg border border-white/60`}>
                  <div className="text-3xl mb-2">{FOOD_CARDS[0].emoji}</div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-amber-700/80">{FOOD_CARDS[0].count}</span>
                    <MapPin className="size-3.5 text-amber-600/60" />
                  </div>
                  <span className="text-xs font-medium text-amber-700/60">{FOOD_CARDS[0].label}</span>
                  <div className="absolute bottom-3 left-3 flex gap-1">
                    <span className="size-2.5 rounded-full bg-amber-400/60" />
                    <span className="size-2.5 rounded-full bg-amber-500/40" />
                  </div>
                </div>

                {/* Card 2 (front, rotated right) */}
                <div className={`absolute right-2 top-0 w-36 h-40 rounded-2xl bg-gradient-to-br ${FOOD_CARDS[1].bg} p-4 ${FOOD_CARDS[1].rotate} shadow-lg border border-white/60`}>
                  <div className="text-3xl mb-2">{FOOD_CARDS[1].emoji}</div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-2xl font-bold text-blue-700/80">{FOOD_CARDS[1].count}</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700/60">{FOOD_CARDS[1].label}</span>
                  <div className="absolute top-3 right-3 text-[10px] font-bold bg-white/60 rounded-md px-1.5 py-0.5 text-blue-600/80">
                    推荐
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Tagline ─── */}
            <h2 className="text-xl font-bold text-center mb-8 leading-snug">
              发现美食，开启你的约饭之旅
            </h2>

            {/* ─── Action Buttons ─── */}
            <div className="space-y-3">
              <Button
                className="w-full h-14 rounded-2xl text-base font-semibold gap-2 shadow-sm"
                onClick={() => router.push('/invite/new')}
              >
                发起约饭
              </Button>
              <Button
                variant="secondary"
                className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
                onClick={() => router.push('/join')}
              >
                输入邀请码
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Tab Bar ─── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border z-50">
        <div className="flex items-end justify-around px-4 pt-2 pb-6">
          {/* Tab: 约饭记录 */}
          <Link href="/home" className="flex flex-col items-center gap-1 py-1">
            <Utensils className="size-5 text-foreground" />
            <span className="text-[11px] font-medium text-foreground">约饭记录</span>
          </Link>

          {/* Tab: Center + Button */}
          <button
            onClick={() => router.push('/invite/new')}
            className="size-12 -mt-4 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg"
          >
            <Plus className="size-6" />
          </button>

          {/* Tab: 个人中心 */}
          <Link href="/profile/edit" className="flex flex-col items-center gap-1 py-1">
            <User className="size-5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">个人中心</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
