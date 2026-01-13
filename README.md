# Campaign-Manager
Architecture

  The app uses the Contentstack App Framework with three UI locations:
  - Full Page Location - Main campaign management dashboard
  - Dashboard Widget - Quick metrics overview widget
  - App Config - Settings panel for app configuration

  Tech Stack

  - React 18 with TypeScript
  - Vite for fast bundling
  - @contentstack/app-sdk for Contentstack integration
  - @contentstack/venus-components for native Contentstack UI styling
  - CSS Modules for scoped component styling

  Key Features

  1. Campaign List - Sortable, filterable table with search
  2. Campaign Form - Create/edit campaigns with validation
  3. Metrics Dashboard - Visual overview of campaign stats
  4. Status Tracking - Draft, Scheduled, Active, Paused, Completed
  5. Multi-channel Support - Email, Social, PPC, Display, Content, SEO
  6. Budget Tracking - Budget allocation and spend monitoring

  Project Structure

  src/
  ├── components/     # UI components (CampaignList, CampaignForm, etc.)
  ├── contexts/       # React contexts (AppSdk, Campaign)
  ├── hooks/          # Custom hooks
  ├── pages/          # Location-specific pages
  ├── styles/         # Global CSS
  ├── types/          # TypeScript interfaces
  └── utils/          # Helper functions

  To Run

  cd /Users/johnkelly/coding/contentstack-campaign-manager
  npm install
  npm run dev

  Research Sources

  - https://github.com/contentstack/app-sdk
  - https://www.contentstack.com/docs/developers/venus-component-library
  - https://github.com/contentstack/marketplace-app-boilerplate
  - https://venus-storybook.contentstack.com/

