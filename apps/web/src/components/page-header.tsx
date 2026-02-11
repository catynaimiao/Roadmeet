'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  back = true,
  rightAction,
  transparent = false,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-3 h-14 ${
        transparent
          ? 'bg-transparent'
          : 'bg-background/80 backdrop-blur-md border-b border-border'
      }`}
    >
      <div className="flex items-center gap-2">
        {back && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        <div>
          {title && (
            <h1 className="text-[15px] font-semibold leading-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
