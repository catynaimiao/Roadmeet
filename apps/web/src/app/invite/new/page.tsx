'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Coffee, Utensils, Wine, Heart, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import type { Purpose, Budget } from '@eatwhat/shared';

const PURPOSES: { value: Purpose; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'coffee_chat', label: 'Coffee Chat', icon: <Coffee className="size-5" />, desc: '轻松聊天' },
  { value: 'meal', label: '约饭', icon: <Utensils className="size-5" />, desc: '一起吃好的' },
  { value: 'drink', label: '小酌', icon: <Wine className="size-5" />, desc: '微醺时刻' },
  { value: 'date', label: '约会', icon: <Heart className="size-5" />, desc: '认真的一餐' },
];

const BUDGETS: { value: Budget; label: string; desc: string }[] = [
  { value: '$', label: '$', desc: '人均 50 内' },
  { value: '$$', label: '$$', desc: '50-150' },
  { value: '$$$', label: '$$$', desc: '150+' },
];

export default function NewInvitePage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<Purpose>('coffee_chat');
  const [budget, setBudget] = useState<Budget>('$$');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [step, setStep] = useState<'form' | 'created'>('form');
  const [copied, setCopied] = useState(false);

  const inviteCode = '847291';

  const handleCreate = () => {
    setStep('created');
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'created') {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <PageHeader title="邀请已创建" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-14">
          <div className="size-16 bg-foreground rounded-2xl flex items-center justify-center mb-8">
            <Check className="size-7 text-background" />
          </div>

          <h2 className="text-2xl font-bold mb-2">约饭邀请已创建</h2>
          <p className="text-sm text-muted-foreground mb-10 text-center leading-relaxed">
            将邀请码分享给好友<br />等 Ta 加入后 AI 将为你们推荐最佳地点
          </p>

          {/* Invite code display */}
          <Card className="w-full max-w-xs p-6 shadow-none border-2 border-border text-center mb-8">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-widest">
              邀请码
            </p>
            <p className="text-4xl font-bold tracking-[0.3em] font-mono mb-5">
              {inviteCode}
            </p>
            <Separator className="mb-5" />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl text-sm gap-2.5 font-medium"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
                {copied ? '已复制' : '复制'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl text-sm gap-2.5 font-medium"
              >
                <Share2 className="size-4.5" />
                分享
              </Button>
            </div>
          </Card>

          <Button
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={() => router.push('/home')}
          >
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader title="创建约饭" />

      <div className="flex-1 px-6 pt-6 pb-32 space-y-7">
        {/* Purpose */}
        <section className="space-y-3">
          <label className="text-sm font-semibold">目的</label>
          <div className="grid grid-cols-2 gap-3">
            {PURPOSES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPurpose(p.value)}
                className={`flex items-center gap-3.5 px-4 py-4.5 rounded-2xl border-2 transition-colors text-left ${
                  purpose === p.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  purpose === p.value ? 'bg-background/15' : 'bg-muted'
                }`}>
                  <span className={purpose === p.value ? 'text-background' : 'text-muted-foreground'}>
                    {p.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{p.label}</p>
                  <p className={`text-xs mt-1 ${
                    purpose === p.value ? 'text-background/60' : 'text-muted-foreground'
                  }`}>
                    {p.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Budget */}
        <section className="space-y-3">
          <label className="text-sm font-semibold">预算</label>
          <div className="flex gap-3">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={`flex-1 py-4 rounded-2xl border-2 transition-colors text-center ${
                  budget === b.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border'
                }`}
              >
                <p className="text-lg font-bold">{b.label}</p>
                <p className={`text-xs mt-1 ${
                  budget === b.value ? 'text-background/60' : 'text-muted-foreground'
                }`}>
                  {b.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="space-y-3">
          <label className="text-sm font-semibold">你的位置</label>
          <div className="flex items-center gap-3 h-13 rounded-2xl border border-input bg-transparent px-4 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
            <MapPin className="size-5 text-muted-foreground shrink-0" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="输入你的出发地址"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground min-w-0"
            />
          </div>
        </section>

        {/* Date & Time */}
        <section className="space-y-3">
          <label className="text-sm font-semibold">时间</label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-13 rounded-2xl text-[15px]"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-13 rounded-2xl text-[15px]"
            />
          </div>
        </section>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8">
        <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold" onClick={handleCreate}>
          创建邀请
        </Button>
      </div>
    </div>
  );
}
