'use client';

import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin, Clock, Check, Sparkles, Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { MOCK_INVITATIONS, MOCK_USERS, MOCK_AI_RESULT } from '@eatwhat/shared';
import type { Candidate } from '@eatwhat/shared';

const MapView = dynamic(
  () => import('@/components/map-view').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-72 bg-muted" /> }
);

export default function InviteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const invitation = MOCK_INVITATIONS[0];
  const host = MOCK_USERS.find((u) => u.id === invitation.hostId)!;
  const guest = MOCK_USERS.find((u) => u.id === invitation.guestId)!;
  const aiResult = MOCK_AI_RESULT;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [partnerSelected, setPartnerSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'loading' | 'selecting' | 'confirmed'>('loading');
  const [streamText, setStreamText] = useState('');

  // Simulate SSE streaming
  useEffect(() => {
    const fullText = aiResult.midpoint_analysis;
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setStreamText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('selecting'), 500);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [aiResult.midpoint_analysis]);

  // Simulate partner selection
  useEffect(() => {
    if (selectedIndex !== null && partnerSelected === null) {
      const timer = setTimeout(() => {
        setPartnerSelected(selectedIndex === 0 ? 0 : 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, partnerSelected]);

  const handleConfirm = () => setPhase('confirmed');

  const allMarkers = [
    ...(invitation.hostLocation
      ? [{ position: [invitation.hostLocation.lat, invitation.hostLocation.lng] as [number, number], label: '发', color: '#000' }]
      : []),
    ...(invitation.guestLocation
      ? [{ position: [invitation.guestLocation.lat, invitation.guestLocation.lng] as [number, number], label: '受', color: '#6b7280' }]
      : []),
    ...aiResult.candidates.map((c, i) => ({
      position: [c.location.lat, c.location.lng] as [number, number],
      label: `${i + 1}`,
      color: selectedIndex === i ? '#16a34a' : '#ef4444',
    })),
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader
        title="AI 推荐"
        subtitle={`与 ${guest.nickname} 的约饭`}
        rightAction={
          phase === 'confirmed' ? (
            <Link href={`/invite/${id}/track`}>
              <Button variant="ghost" size="sm" className="rounded-full size-8 p-0">
                <Navigation className="size-[18px]" />
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Map */}
      <MapView
        center={[31.215, 121.46]}
        zoom={13}
        markers={allMarkers}
        style={{ height: '280px' }}
      />

      {/* Sheet content */}
      <div className="flex-1 -mt-4 relative z-10">
        <div className="bg-background rounded-t-2xl border-t border-border">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
          </div>

          <div className="px-6 pb-36">
            {/* AI Analysis */}
            <Card className="p-5 mb-6 shadow-none border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-foreground flex items-center justify-center shrink-0">
                  <Sparkles className="size-[18px] text-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                    AI 选址分析
                  </p>
                  <p className="text-sm leading-relaxed">
                    {streamText}
                    {phase === 'loading' && (
                      <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Participants */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex -space-x-2">
                <Avatar className="size-8 border-2 border-background">
                  <AvatarImage src={host.avatarUrl} />
                  <AvatarFallback className="text-[10px]">{host.nickname[0]}</AvatarFallback>
                </Avatar>
                <Avatar className="size-8 border-2 border-background">
                  <AvatarImage src={guest.avatarUrl} />
                  <AvatarFallback className="text-[10px]">{guest.nickname[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{host.nickname}</span>
                {' '}与{' '}
                <span className="font-medium text-foreground">{guest.nickname}</span>
              </span>
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5" />
                周六 14:00
              </span>
            </div>

            {/* Candidates */}
            {phase !== 'loading' && (
              <div className="space-y-4">
                <p className="text-sm font-bold">
                  推荐候选 · {aiResult.candidates.length} 个地点
                </p>
                {aiResult.candidates.map((candidate, index) => (
                  <CandidateCard
                    key={index}
                    candidate={candidate}
                    index={index}
                    isSelected={selectedIndex === index}
                    isPartnerSelected={partnerSelected === index}
                    onSelect={() => setSelectedIndex(index)}
                    disabled={phase === 'confirmed'}
                  />
                ))}
              </div>
            )}

            {/* Selection status */}
            {selectedIndex !== null && phase !== 'confirmed' && (
              <Card className="mt-6 p-5 shadow-none border border-border">
                <p className="text-sm font-bold mb-4">选择状态</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="size-6 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="size-3.5 text-background" />
                    </div>
                    <span>{host.nickname}：</span>
                    <span className="font-medium">{aiResult.candidates[selectedIndex].venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    {partnerSelected !== null ? (
                      <div className="size-6 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="size-3.5 text-background" />
                      </div>
                    ) : (
                      <div className="size-6 rounded-full border-2 border-muted-foreground/30 animate-pulse" />
                    )}
                    <span>{guest.nickname}：</span>
                    <span className="font-medium">
                      {partnerSelected !== null
                        ? aiResult.candidates[partnerSelected].venue_name
                        : '等待选择...'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {selectedIndex !== null && partnerSelected !== null && phase !== 'confirmed' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8">
          <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold" onClick={handleConfirm}>
            确认地点 · {aiResult.candidates[selectedIndex].venue_name}
          </Button>
        </div>
      )}

      {phase === 'confirmed' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8">
          <Link href={`/invite/${id}/track`} className="block">
            <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold gap-2">
              <Navigation className="size-5" />
              开始导航 · 查看轨迹
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ──────────── Candidate Card ──────────── */
function CandidateCard({
  candidate,
  index,
  isSelected,
  isPartnerSelected,
  onSelect,
  disabled,
}: {
  candidate: Candidate;
  index: number;
  isSelected: boolean;
  isPartnerSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${
        isSelected
          ? 'border-foreground shadow-sm'
          : isPartnerSelected
          ? 'border-green-500/60'
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      {/* Image */}
      {candidate.imgUrl && (
        <div className="h-40 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candidate.imgUrl}
            alt={candidate.venue_name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="size-7 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-bold shrink-0">
              {index + 1}
            </span>
            <h4 className="font-bold text-[15px]">{candidate.venue_name}</h4>
          </div>
          <span className="text-sm font-bold shrink-0">
            ¥{candidate.estimated_cost}
          </span>
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2.5">
          <MapPin className="size-3.5 shrink-0" />
          {candidate.address}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {candidate.recommendation_reason}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {candidate.best_for.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px] rounded-lg px-2 py-0.5 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            推荐：{candidate.suggested_item}
          </span>
        </div>

        {(isSelected || isPartnerSelected) && (
          <>
            <Separator className="my-3" />
            <div className="flex gap-2">
              {isSelected && (
                <Badge className="rounded-full text-xs h-6 px-3">你的选择</Badge>
              )}
              {isPartnerSelected && (
                <Badge variant="outline" className="rounded-full text-xs h-6 px-3 border-green-500/60 text-green-600">
                  对方的选择
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
    </button>
  );
}
