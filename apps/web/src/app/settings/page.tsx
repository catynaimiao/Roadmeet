'use client';

import { useRouter } from 'next/navigation';
import {
  User, Bell, Shield, Moon, HelpCircle, MessageSquare,
  ChevronRight, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { MOCK_USERS } from '@eatwhat/shared';

const MENU_SECTIONS = [
  {
    items: [
      { icon: User, label: '个人资料', href: '/profile/edit' },
      { icon: Bell, label: '通知设置', href: '#' },
      { icon: Shield, label: '隐私与安全', href: '#' },
    ],
  },
  {
    items: [
      { icon: Moon, label: '深色模式', href: '#', toggle: true },
      { icon: HelpCircle, label: '帮助中心', href: '#' },
      { icon: MessageSquare, label: '反馈建议', href: '#' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const user = MOCK_USERS[0];

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title="设置" />

      <div className="px-6 pt-4 pb-28">
        {/* User card */}
        <Card className="flex items-center gap-4 p-5 mb-7 shadow-none border border-border cursor-pointer" onClick={() => router.push('/profile/edit')}>
          <Avatar className="size-14 border border-border">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback className="text-base">{user.nickname[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold">{user.nickname}</p>
            <p className="text-sm text-muted-foreground truncate mt-0.5">{user.bio}</p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Card>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section, si) => (
          <div key={si} className="mb-5">
            <Card className="shadow-none border border-border divide-y divide-border">
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => item.href !== '#' && router.push(item.href)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <item.icon className="size-5 text-muted-foreground" />
                  <span className="flex-1 text-[15px]">{item.label}</span>
                  {item.toggle ? (
                    <div className="w-10 h-5.5 rounded-full bg-muted-foreground/20 relative">
                      <div className="absolute top-0.5 left-0.5 size-4.5 bg-background rounded-full shadow-sm transition-transform" />
                    </div>
                  ) : (
                    <ChevronRight className="size-5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </Card>
          </div>
        ))}

        <Separator className="my-7" />

        {/* App info */}
        <div className="text-center mb-7">
          <p className="text-sm text-muted-foreground">EatWhat v0.1.0</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Built with ❤️ for Hackathon</p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-13 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5 gap-2 text-[15px] font-semibold"
          onClick={() => router.push('/login')}
        >
          <LogOut className="size-5" />
          退出登录
        </Button>
      </div>
    </div>
  );
}
