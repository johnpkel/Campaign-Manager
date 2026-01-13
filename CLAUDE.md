# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (Vite, port 3000)
npm run build      # TypeScript check + Vite build
npm run type-check # TypeScript type checking only
npm run lint       # ESLint with zero warnings allowed
npm run preview    # Preview production build
```

## Architecture

This is a Contentstack App (marketplace app) built with React 18, TypeScript, and Vite. It uses the `@contentstack/app-sdk` for integration and `@contentstack/venus-components` for UI.

### Contentstack Integration

**Stack:** `blte94096625af38792`
**Content Type:** `cs_campaign_manager` - "(CS) Campaign Manager"

Credentials stored in `.env.local`:
- `CONTENTSTACK_API_KEY`
- `CONTENTSTACK_MANAGEMENT_TOKEN`

### Location-Based Rendering

The app renders different components based on where it's embedded in Contentstack:
- `FULL_PAGE_LOCATION` - Main campaign management interface with metrics and CRUD operations
- `DASHBOARD` - Widget showing campaign overview metrics
- `APP_CONFIG_WIDGET` - Configuration panel for app settings

The `LocationRouter` in `App.tsx` handles routing based on `sdk.location.type`. In standalone mode (outside Contentstack iframe), it defaults to full page view with mock data.

### Service Layer

`src/services/campaignService.ts` provides an abstraction for campaign CRUD operations:
- `MockCampaignService` - Uses local state for standalone development
- `ContentstackCampaignService` - Uses SDK to fetch/save entries from `cs_campaign_manager` content type

### Context Providers

- **AppSdkContext** (`src/contexts/AppSdkContext.tsx`): Manages Contentstack SDK initialization, stack reference, location detection, and app configuration. Provides `useAppSdk()` hook with `sdk`, `stack`, `isStandaloneMode`.
- **CampaignContext** (`src/contexts/CampaignContext.tsx`): Manages campaign state with async CRUD operations. Provides `useCampaigns()` hook with campaigns array, metrics, and async methods.

### Type System

Core types in `src/types/campaign.ts`:
- `Campaign` - Main entity matching Contentstack entry structure (uid, title, key_messages, campaign_goals, etc.)
- `CampaignStatus` - `active` | `paused` | `completed`
- `CampaignChannel` - `Web` | `Native Mobile` | `Social` | `Ads` | `Email`
- `RTEContent` / `RTENode` - JSON RTE field structure

### Path Alias

`@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts).

### Known Issues

Venus Components library has React types mismatch causing TypeScript errors. These don't affect runtime behavior.
