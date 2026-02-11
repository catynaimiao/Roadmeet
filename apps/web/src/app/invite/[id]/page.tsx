'use client';

import { useEffect, useRef, useState, use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Check,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import {
  MOCK_INVITATIONS,
  MOCK_USERS,
  MOCK_AI_RESULT,
  AIRecommendationResultSchema,
} from '@eatwhat/shared';
import type { Candidate, AIRecommendationResult, AIMatchInput } from '@eatwhat/shared';

const MapView = dynamic(
  () => import('@/components/map-view').then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-72 bg-muted" /> }
);

const GENERATION_STEPS = [
  { label: '定位双方出发点', delayMs: 400 },
  { label: '匹配偏好与预算', delayMs: 900 },
  { label: '筛选通勤友好候选', delayMs: 1400 },
  { label: '生成推荐理由', delayMs: 1900 },
];

const formatContextTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) return scheduledAt;
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' });
  const time = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${weekday} ${time}`;
};

const fetchRecommendation = async (input: AIMatchInput): Promise<AIRecommendationResult> => {
  const response = await fetch('/api/dashscope', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
    }),
  });

  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message = String(data.message ?? 'AI request failed.');
    throw new Error(message);
  }

  const validated = AIRecommendationResultSchema.safeParse(data);
  if (!validated.success) {
    throw new Error('AI response does not match expected schema.');
  }
  return validated.data;
};

export default function InviteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const invitation = MOCK_INVITATIONS[0];
  const host = MOCK_USERS.find((u) => u.id === invitation.hostId)!;
  const guest = MOCK_USERS.find((u) => u.id === invitation.guestId)!;
  const [aiResult, setAiResult] = useState<AIRecommendationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState(GENERATION_STEPS[0].label);
  const resolvedResult = aiResult ?? MOCK_AI_RESULT;
  const candidateList = aiResult ? resolvedResult.candidates : [];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [partnerSelected, setPartnerSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'loading' | 'selecting' | 'confirmed'>('loading');
  const [streamText, setStreamText] = useState('');
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartXRef = useRef(0);

  useEffect(() => {
    if (!aiLoading) return;
    setGenerationStatus(GENERATION_STEPS[0].label);
    const timers = GENERATION_STEPS.slice(1).map((step) =>
      setTimeout(() => setGenerationStatus(step.label), step.delayMs)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [aiLoading]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      setAiLoading(true);
      setAiError(null);
      setPhase('loading');
      setStreamText('');
      setSelectedIndex(null);
      setPartnerSelected(null);

      const hostLocation = invitation.hostLocation ?? undefined;
      const guestLocation = invitation.guestLocation ?? undefined;
      const input: AIMatchInput = {
        host: {
          location: hostLocation,
          address: invitation.hostAddress,
          profile: {
            tags: host.tags,
            food_pref: host.foodPreferences ?? [],
          },
          purpose: 'Coffee Chat',
          budget: '$$',
        },
        guest: {
          location: guestLocation,
          address: invitation.guestAddress,
          profile: {
            tags: guest.tags,
            food_pref: guest.foodPreferences ?? [],
          },
        },
        context: {
          time: formatContextTime(invitation.scheduledAt),
          purpose: 'Coffee Chat',
        },
      };

      try {
        const result = await fetchRecommendation(input);
        if (!isActive) return;
        setAiResult(result);
      } catch (error) {
        if (!isActive) return;
        setAiError(error instanceof Error ? error.message : 'AI request failed.');
        setAiResult(MOCK_AI_RESULT);
      } finally {
        if (!isActive) return;
        setAiLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [invitation.hostAddress, invitation.guestAddress, invitation.scheduledAt, host.tags, host.foodPreferences, guest.tags, guest.foodPreferences]);

  useEffect(() => {
    if (!aiResult) return;
    const fullText = aiResult.midpoint_analysis;
    let i = 0;
    setStreamText('');
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
  }, [aiResult]);

  useEffect(() => {
    if (selectedIndex !== null && partnerSelected === null) {
      const timer = setTimeout(() => {
        setPartnerSelected(selectedIndex === 0 ? 0 : 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, partnerSelected]);

  const handleConfirm = () => setPhase('confirmed');

  const handleCarouselMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = carouselRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    dragStartXRef.current = event.pageX - container.offsetLeft;
    scrollStartXRef.current = container.scrollLeft;
  };

  const handleCarouselMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleCarouselMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCarouselMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = carouselRef.current;
    if (!container || !isDraggingRef.current) return;
    event.preventDefault();
    const x = event.pageX - container.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.1;
    container.scrollLeft = scrollStartXRef.current - walk;
  };

  const allMarkers = [
    ...(invitation.hostLocation
      ? [{ position: [invitation.hostLocation.lat, invitation.hostLocation.lng] as [number, number], label: '主', color: '#000' }]
      : []),
    ...(invitation.guestLocation
      ? [{ position: [invitation.guestLocation.lat, invitation.guestLocation.lng] as [number, number], label: '客', color: '#6b7280' }]
      : []),
    ...candidateList.map((c, i) => ({
      position: [c.location.lat, c.location.lng] as [number, number],
      label: `${i + 1}`,
      color: selectedIndex === i ? '#16a34a' : '#ef4444',
    })),
  ];

  const displayTime = formatContextTime(invitation.scheduledAt);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader
        title="AI 推荐"
        subtitle={`${host.nickname} 与 ${guest.nickname} 的约饭`}
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

      <MapView
        center={[31.215, 121.46]}
        zoom={13}
        markers={allMarkers}
        style={{ height: '280px' }}
      />

      <div className="flex-1 -mt-4 relative z-10">
        <div className="bg-background rounded-t-2xl border-t border-border">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
          </div>

          <div className="px-6 pb-36">
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
                  {(aiLoading || aiError) && (
                    <div className="mt-2 space-y-1">
                      {aiLoading && (
                        <p className="text-xs text-muted-foreground">AI 生成中：{generationStatus}</p>
                      )}
                      {aiError && (
                        <p className="text-xs text-amber-600">AI 请求失败，已使用备用推荐。</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

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
                {displayTime}
              </span>
            </div>

            {phase !== 'loading' && (
              <div>
                <p className="text-sm font-bold mb-3">
                  推荐候选 · {resolvedResult.candidates.length} 家
                </p>
                <div
                  ref={carouselRef}
                  onMouseDown={handleCarouselMouseDown}
                  onMouseLeave={handleCarouselMouseLeave}
                  onMouseUp={handleCarouselMouseUp}
                  onMouseMove={handleCarouselMouseMove}
                  className="flex gap-4 overflow-x-auto -mx-6 px-6 pb-2 snap-x snap-mandatory touch-pan-x overscroll-x-contain scroll-smooth cursor-grab active:cursor-grabbing"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {resolvedResult.candidates.map((candidate, index) => (
                    <CandidateCard
                      key={index}
                      candidate={candidate}
                      index={index}
                      isSelected={selectedIndex === index}
                      isPartnerSelected={partnerSelected === index}
                      onSelect={() => setSelectedIndex(index)}
                      disabled={phase === 'confirmed'}
                      className="min-w-[85%] shrink-0 snap-start"
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedIndex !== null && phase !== 'confirmed' && (
              <Card className="mt-6 p-5 shadow-none border border-border">
                <p className="text-sm font-bold mb-4">待确认的选择</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="size-6 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="size-3.5 text-background" />
                    </div>
                    <span>{host.nickname} 选择</span>
                    <span className="font-medium">{resolvedResult.candidates[selectedIndex].venue_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    {partnerSelected !== null ? (
                      <div className="size-6 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="size-3.5 text-background" />
                      </div>
                    ) : (
                      <div className="size-6 rounded-full border-2 border-muted-foreground/30 animate-pulse" />
                    )}
                    <span>{guest.nickname} 选择</span>
                    <span className="font-medium">
                      {partnerSelected !== null
                        ? resolvedResult.candidates[partnerSelected].venue_name
                        : '等待对方选择...'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {selectedIndex !== null && partnerSelected !== null && phase !== 'confirmed' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8 z-20">
          <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold" onClick={handleConfirm}>
            确认约饭：{resolvedResult.candidates[selectedIndex].venue_name}
          </Button>
        </div>
      )}

      {phase === 'confirmed' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8 z-20">
          <Link href={`/invite/${id}/track`} className="block">
            <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold gap-2">
              <Navigation className="size-5" />
              查看路线与地点
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function CandidateCard({
  candidate,
  index,
  isSelected,
  isPartnerSelected,
  onSelect,
  disabled,
  className,
}: {
  candidate: Candidate;
  index: number;
  isSelected: boolean;
  isPartnerSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all ${className ?? ''} ${
        isSelected
          ? 'border-foreground shadow-sm'
          : isPartnerSelected
          ? 'border-green-500/60'
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
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
          <span className="text-sm font-bold shrink-0">¥{candidate.estimated_cost}</span>
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
            推荐菜：{candidate.suggested_item}
          </span>
        </div>

        <div className={`h-12 ${isSelected || isPartnerSelected ? '' : 'opacity-0'}`}>
          <Separator className="my-3" />
          <div className="flex gap-2">
            {isSelected && (
              <Badge className="rounded-full text-xs h-6 px-3">你的选择</Badge>
            )}
            {isPartnerSelected && (
              <Badge variant="outline" className="rounded-full text-xs h-6 px-3 border-green-500/60 text-green-600">
                对方选择
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
