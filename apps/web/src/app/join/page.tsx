"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PageHeader } from "@/components/page-header";
import { MOCK_USERS, MOCK_INVITATIONS } from "@eatwhat/shared";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "found" | "location">("code");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const host = MOCK_USERS[0];
  const invitation = MOCK_INVITATIONS[0];

  const handleCodeComplete = (val: string) => {
    setCode(val);
    if (val.length === 6) setTimeout(() => setStep("found"), 500);
  };

  const handleJoin = () => {
    router.push(`/invite/${invitation.id}`);
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <PageHeader title="输入邀请码" />

      <div className="flex-1 px-6 py-8 flex justify-center">
        <div className="w-full max-w-md">
        {/* ─── Step 1: Code Input ─── */}
        {step === "code" && (
          <div className="flex flex-col items-center pt-12">
            <div className="size-16 rounded-2xl bg-foreground flex items-center justify-center mb-8">
              <Ticket className="size-7 text-background" />
            </div>

            <h2 className="text-2xl font-bold mb-2">输入邀请码</h2>
            <p className="text-sm text-muted-foreground mb-10 text-center leading-relaxed">
              输入好友分享的 6 位邀请码
              <br />
              加入 Ta 的约饭
            </p>

            <InputOTP
              maxLength={6}
              value={code}
              onChange={handleCodeComplete}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="size-14 text-xl font-bold" />
                <InputOTPSlot index={1} className="size-14 text-xl font-bold" />
                <InputOTPSlot index={2} className="size-14 text-xl font-bold" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="size-14 text-xl font-bold" />
                <InputOTPSlot index={4} className="size-14 text-xl font-bold" />
                <InputOTPSlot index={5} className="size-14 text-xl font-bold" />
              </InputOTPGroup>
            </InputOTP>

            <p className="text-xs text-muted-foreground mt-8">
              邀请码通常为 6 位数字或字母组合
            </p>
          </div>
        )}

        {/* ─── Step 2: Found — Ticket Card ─── */}
        {step === "found" && (
          <div className="py-8">
            <Card className="overflow-hidden shadow-xl border border-border/50 rounded-3xl bg-card">
              {/* Ticket Top */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium px-4 py-1.5"
                  >
                    Coffee Chat
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono tracking-widest">
                    #{code || "847291"}
                  </span>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <Avatar className="size-16 border-2 border-border shadow-sm">
                    <AvatarImage src={host.avatarUrl} />
                    <AvatarFallback className="text-xl font-medium">
                      {host.nickname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-bold text-xl leading-tight">
                      {host.nickname}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {host.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {host.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs rounded-full font-normal px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dashed tear line */}
              <div className="relative h-6 flex items-center">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-6 rounded-full bg-background" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-6 rounded-full bg-background" />
                <div className="border-t-2 border-dashed border-border/60 w-full mx-6" />
              </div>

              {/* Ticket Bottom */}
              <div className="p-8 pt-2 space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-3">
                    <Clock className="size-4" />
                    时间
                  </span>
                  <span className="text-sm font-semibold">周六 14:00</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-3">
                    <DollarSign className="size-4" />
                    预算
                  </span>
                  <span className="text-sm font-semibold">$$</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-3">
                    <MapPin className="size-4" />
                    出发地
                  </span>
                  <span className="text-sm font-semibold truncate max-w-45">
                    {invitation.hostAddress}
                  </span>
                </div>
              </div>
            </Card>

            <Button
              className="w-full h-14 rounded-2xl text-base font-semibold mt-8"
              onClick={() => setStep("location")}
            >
              接受邀请
            </Button>
          </div>
        )}

        {/* ─── Step 3: Location ─── */}
        {step === "location" && (
          <div className="pt-6 pb-8">
            <h2 className="text-xl font-bold mb-2">你的出发位置</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              告诉我们你从哪里出发，AI 会为你们推荐最佳中间地点
            </p>

            <div className="space-y-3 mb-8">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="输入你的出发地址"
                  className="h-13 pl-12 rounded-2xl text-[15px]"
                  autoFocus
                />
              </div>

              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl text-sm gap-2 font-medium"
                onClick={() => setAddress("漕溪北路 331 号")}
              >
                <MapPin className="size-4.5" />
                使用当前位置
              </Button>
            </div>

            <Button
              className="w-full h-13 rounded-2xl text-[15px] font-semibold"
              onClick={handleJoin}
              disabled={!address}
            >
              确认 · 开始匹配
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
