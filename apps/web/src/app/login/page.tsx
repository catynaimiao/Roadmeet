'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center px-8">
        {/* Brand */}
        <div className="mb-16">
          <div className="size-14 bg-foreground rounded-2xl flex items-center justify-center mb-6">
            <span className="text-background text-2xl">🍽</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-none mb-2">
            EatWhat
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            找到对的人，选对的餐厅
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-14 text-base rounded-2xl font-semibold"
            onClick={() => router.push('/home')}
          >
            开始使用
          </Button>
          <Button
            variant="secondary"
            className="w-full h-14 text-base rounded-2xl font-semibold"
            onClick={() => router.push('/join')}
          >
            输入邀请码
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 pb-10 text-center">
        <p className="text-xs text-muted-foreground/50">
          继续表示同意服务条款与隐私政策
        </p>
      </div>
    </div>
  );
}
