# EatWhat · 约饭

> 找到对的人，选对的餐厅

一个基于 AI 推荐的社交约饭应用，参考 Uber 设计风格 + Bonjour 社交概念。

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 |
| Worker | Hono.js (SSE / AI tasks) |
| Map | Leaflet + CartoDB tiles |
| Infra | Docker Compose (PostgreSQL + Redis) |
| AI | 阿里云百炼 Agent |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start frontend
pnpm dev:web      # → http://localhost:3000

# Start worker (optional)
pnpm dev:worker   # → http://localhost:3001

# Start infra (optional, requires Docker)
pnpm infra:up
```

## Pages

| Route | Description |
|-------|------------|
| `/login` | OTP 验证码登录 |
| `/home` | 个人主页 + 地图 + 标签 + 必去地点 |
| `/profile/edit` | BentoGrid 资料编辑 |
| `/settings` | 设置页面 |
| `/invite/new` | 创建约饭邀请 |
| `/invite/[id]` | AI 推荐结果 + 双方选择 |
| `/invite/[id]/track` | 实时轨迹追踪 + 打卡 |

## Project Structure

```
apps/
  web/          # Next.js frontend + BFF
  worker/       # Hono.js SSE worker
packages/
  shared/       # Types + Zod schemas + Mock data
infra/
  docker-compose.yml
```

## Demo Flow

1. 打开 `/login` → 输入手机号 → 输入验证码
2. 进入 `/home` → 查看个人主页/地图/标签
3. 点击「立刻找搭子」→ 选择目的/预算/位置
4. 进入 AI 推荐页 → 观看分析流式输出 → 选择餐厅
5. 等待对方选择 → 确认地点
6. 进入轨迹页 → 实时路线 → 到达打卡
