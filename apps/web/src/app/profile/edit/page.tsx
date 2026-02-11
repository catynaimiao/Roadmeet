'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { MOCK_USERS, MOCK_USER_TAGS, MOCK_FAVORITE_SPOTS } from '@eatwhat/shared';

const ALL_TAGS = ['咖啡控', '火锅爱好者', '日料', '甜品', '素食', '深夜食堂', '早午餐', '露营', '探店达人', '米其林'];

export default function ProfileEditPage() {
  const router = useRouter();
  const user = MOCK_USERS[0];

  const [nickname, setNickname] = useState(user.nickname);
  const [bio, setBio] = useState(user.bio);
  const [selectedTags, setSelectedTags] = useState<string[]>(MOCK_USER_TAGS.slice(0, 4).map((t) => t.label));

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="编辑资料"
        rightAction={
          <Button variant="ghost" size="sm" className="text-sm font-semibold" onClick={handleSave}>
            保存
          </Button>
        }
      />

      <div className="px-6 pt-4 pb-28">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            <Avatar className="size-24 border-2 border-border">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xl">{user.nickname[0]}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 size-8 bg-foreground text-background rounded-full flex items-center justify-center shadow-sm">
              <Camera className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">点击更换头像</p>
        </div>

        {/* Basic info */}
        <div className="space-y-5 mb-8">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">昵称</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="你的昵称"
              className="h-13 rounded-2xl text-[15px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">签名</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="一句话介绍自己"
              className="h-13 rounded-2xl text-[15px]"
            />
          </div>
        </div>

        <Separator className="mb-7" />

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-1.5">美食标签</h3>
          <p className="text-xs text-muted-foreground mb-4">选择你感兴趣的美食类型</p>
          <div className="flex flex-wrap gap-2.5">
            {ALL_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] transition-all"
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) && <span className="mr-1">✓</span>}
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="mb-7" />

        {/* Favorite spots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold">常去的店</h3>
              <p className="text-xs text-muted-foreground mt-0.5">展示在你的个人主页</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full text-xs h-8 gap-1.5 px-3">
              <Plus className="size-3.5" />
              添加
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_FAVORITE_SPOTS.map((spot, i) => (
              <Card key={i} className="overflow-hidden shadow-none border border-border">
                <div className="flex h-28">
                  {/* Left image */}
                  <div className="w-28 shrink-0 bg-muted">
                    {spot.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">🍽</span>
                    )}
                  </div>
                  {/* Right content */}
                  <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                    <div>
                      <Badge variant="secondary" className="text-[11px] rounded-md px-2 py-0.5 mb-2 font-normal">
                        {spot.category}
                      </Badge>
                      <p className="text-[15px] font-semibold truncate">{spot.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      上海市
                    </p>
                  </div>
                  {/* Delete */}
                  <button className="self-start p-3 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom save */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border p-5 pb-8">
        <Button className="w-full h-13 rounded-2xl text-[15px] font-semibold" onClick={handleSave}>
          保存修改
        </Button>
      </div>
    </div>
  );
}
