'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { Clock, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import {
  MOCK_INVITATIONS, MOCK_USERS, MOCK_TRACK_POINTS, MOCK_AI_RESULT,
} from '@eatwhat/shared';

const MapView = dynamic(
  () => import('@/components/map-view').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-muted" /> }
);

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const invitation = MOCK_INVITATIONS[0];
  const host = MOCK_USERS.find((u) => u.id === invitation.hostId)!;
  const guest = MOCK_USERS.find((u) => u.id === invitation.guestId)!;
  const venue = MOCK_AI_RESULT.candidates[0];

  const [showRoute, setShowRoute] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const hostPoints = MOCK_TRACK_POINTS.filter((p) => p.userId === 'u1');
  const guestPoints = MOCK_TRACK_POINTS.filter((p) => p.userId === 'u2');

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const hostRoute = hostPoints.map((p) => [p.location.lat, p.location.lng] as [number, number]);
  const guestRoute = guestPoints.map((p) => [p.location.lat, p.location.lng] as [number, number]);

  const calcDist = (points: typeof hostPoints) => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const dlat = points[i].location.lat - points[i - 1].location.lat;
      const dlng = points[i].location.lng - points[i - 1].location.lng;
      total += Math.sqrt(dlat * dlat + dlng * dlng) * 111;
    }
    return total.toFixed(1);
  };

  const markers = [
    ...(hostPoints.length > 0
      ? [{ position: [hostPoints[hostPoints.length - 1].location.lat, hostPoints[hostPoints.length - 1].location.lng] as [number, number], label: '你', color: '#000' }]
      : []),
    ...(guestPoints.length > 0
      ? [{ position: [guestPoints[guestPoints.length - 1].location.lat, guestPoints[guestPoints.length - 1].location.lng] as [number, number], label: '友', color: '#6b7280' }]
      : []),
    { position: [venue.location.lat, venue.location.lng] as [number, number], label: '🍽', color: '#22c55e' },
  ];

  const polylines = showRoute
    ? [
        { positions: hostRoute, color: '#000000', dashArray: undefined },
        { positions: guestRoute, color: '#6b7280', dashArray: '8 4' },
      ]
    : [];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader title={venue.venue_name} subtitle="实时轨迹" transparent />

      {/* Map */}
      <div className="relative">
        <MapView
          center={[31.215, 121.458]}
          zoom={13}
          markers={markers}
          polylines={polylines}
          style={{ height: '420px' }}
        />

        {/* Route toggle */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg shadow-md border border-border text-xs font-medium"
          >
            <div className={`w-8 h-4 rounded-full relative transition-colors ${showRoute ? 'bg-foreground' : 'bg-muted-foreground/30'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-background rounded-full transition-transform ${showRoute ? 'left-4' : 'left-0.5'}`} />
            </div>
            行程路线
          </button>
        </div>

        {showRoute && (
          <Badge className="absolute top-20 right-4 z-[1000] rounded-full shadow-md">
            全程 {(parseFloat(calcDist(hostPoints)) + parseFloat(calcDist(guestPoints))).toFixed(1)}km
          </Badge>
        )}
      </div>

      {/* Bottom sheet */}
      <div className="flex-1 -mt-4 relative z-10">
        <div className="bg-background rounded-t-2xl border-t border-border">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
          </div>

          <div className="px-6 pb-36">
            {/* Timer + Venue */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-3xl font-bold tracking-tight">{formatTime(elapsed)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">已出发</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold">{venue.venue_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-end mt-0.5">
                  <MapPin className="size-3.5" />{venue.address}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3 mb-6">
              <Card className="flex items-center gap-4 p-4 shadow-none border border-border">
                <Avatar className="size-11 border border-border">
                  <AvatarImage src={host.avatarUrl} />
                  <AvatarFallback className="text-sm">{host.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold">
                    {host.nickname}
                    <span className="text-muted-foreground font-normal"> · 你</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">已行走 {calcDist(hostPoints)} km</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="size-2.5 rounded-full bg-foreground" />
                  行进中
                </div>
              </Card>

              <Card className="flex items-center gap-4 p-4 shadow-none border border-border">
                <Avatar className="size-11 border border-border">
                  <AvatarImage src={guest.avatarUrl} />
                  <AvatarFallback className="text-sm">{guest.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold">{guest.nickname}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">已行走 {calcDist(guestPoints)} km</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span className="size-2.5 rounded-full bg-muted-foreground/50" />
                  行进中
                </div>
              </Card>
            </div>

            {/* Venue card */}
            <Card className="overflow-hidden shadow-none border border-border">
              {venue.imgUrl && (
                <div className="h-36 overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={venue.imgUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <h4 className="font-bold text-[15px] mb-1.5">{venue.venue_name}</h4>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{venue.recommendation_reason}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>推荐：{venue.suggested_item}</span>
                  <span className="font-medium">¥{venue.estimated_cost}/人</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Check-in */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8">
        {!checkedIn ? (
          <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold gap-2" onClick={() => setCheckedIn(true)}>
            <CheckCircle className="size-5" />
            到达打卡
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3.5 text-green-600">
            <CheckCircle className="size-5" />
            <span className="font-bold text-[15px]">已打卡 · 用餐愉快！</span>
          </div>
        )}
      </div>
    </div>
  );
}
