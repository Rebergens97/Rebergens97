# DrepanHope Foundation - Product Requirements Document

## Original Problem Statement
Build a modern donation website for DrepanHope Foundation (USA-based, global mission) inspired by Compassion.com with:
- Bilingual EN/FR support with language switcher
- 8 public pages (Home, Donate, Campaign pages, Transparency, FAQ, Contact, Thank You)
- Admin Panel with JWT auth and RBAC (Owner/Admin/Editor/Viewer)
- Donation amount cards with impact text
- Trust signals, transparency reports, audit logs

## User Personas
1. **Donors** - US and global individuals wanting to support sickle cell disease awareness
2. **Expectant parents** - Seeking information about genetic testing and prenatal care
3. **Admin users** - Foundation staff managing campaigns, donations, reports

## Core Requirements (Static)
- Deep navy + teal + coral color palette
- Mobile-first responsive design
- JWT authentication with role-based access control
- MongoDB database with audit logging

## What's Been Implemented (January 2026)

### Public Website
- ✅ Homepage with healthcare hero image, trust line, featured campaigns
- ✅ Explicit EN|FR language toggle with localStorage persistence
- ✅ All 6 campaigns: 2 featured + 4 additional programs
- ✅ Donate page with campaign dropdown selector for all 6 campaigns
- ✅ Campaign-specific impact text per donation amount
- ✅ **Stripe Checkout Integration** - Live payment processing
- ✅ Transparency page with $0/$0 consistent counters (fresh start)
- ✅ FAQ page with accordion (8 questions EN/FR)
- ✅ Contact page with form, email, WhatsApp
- ✅ Thank You page with payment status polling from Stripe
- ✅ Dynamic footer year
- ✅ **Blog** - /blog page with post listing, tags, search
- ✅ **Single Post** - /blog/:slug with full content, share, related posts
- ✅ **Blog in nav** - Added to header between Campaigns and Transparency
- ✅ **Donate CTA on blog** - Both listing and single post pages

### Admin Panel
- ✅ JWT authentication with password change on first login
- ✅ **Dev Mode Toggle** - Dev tools only visible when DEV_MODE=true
- ✅ Dev endpoint to reset owner password (POST /api/dev/reset-owner) - disabled in production
- ✅ Force password change enforcement on all protected routes
- ✅ Clear login error messages (User not found / Wrong password / User disabled)
- ✅ **Dashboard Metrics** - Revenue shows PAID only, separate pending stats
  - Today/Month/All Time Revenue = sum of paid donations
  - Pending card shows count + amount separately
  - Status Overview shows breakdown by paid/pending
  - By Campaign shows paid totals only
- ✅ **Campaign Ordering** - Drag-and-drop reordering with dnd-kit
- ✅ Campaigns management with featured flag and reordering
- ✅ Custom donation impact texts (EN/FR) per campaign
- ✅ Donations management with status change and CSV export
- ✅ **Blog Posts management** - /admin/posts with CRUD, draft/published toggle
- ✅ **Image Upload** - Cloudinary integration with drag/drop, preview, URL fallback
- ✅ Transparency reports management
- ✅ News updates management
- ✅ User management (Owner only)
- ✅ Settings management (Owner only)
- ✅ Audit logging for all changes

### Payment Integration
- ✅ **Stripe Checkout** - Test mode enabled
- ✅ One-time and monthly donations supported
- ✅ POST /api/donations/checkout - Creates Stripe session
- ✅ GET /api/donations/status/:session_id - Polls payment status
- ✅ POST /api/webhooks/stripe - Webhook handler for payment confirmation
- ✅ Fallback to mock mode if Stripe not configured

### Campaigns Seeded
1. Sickle Cell Disease Support (Featured)
2. Pregnancy & Genetic Testing (Featured)
3. Newborn Screening (Early Diagnosis)
4. Emergency Relief Fund (Crisis Support)
5. Medication Access
6. Patient Education & Community Awareness

## Prioritized Backlog

### P0 - Critical
- None currently

### P1 - High Priority
- Stripe payment integration (when ready for live payments)
- Email notifications for donations
- Receipt generation for donors

### P2 - Medium Priority
- Donation goals progress bars
- Social sharing for campaigns
- Monthly donation management portal
- Blog/news section

### P3 - Low Priority
- Multi-currency support
- Volunteer signup
- Event calendar
- Partner organization portal

## Admin Credentials
- Email: admin@drepanhope.org
- Default temp password: Temp@12345! (after clicking "Reset Owner Password" button or calling POST /api/dev/reset-owner)
- Login page has a DEV DEBUG MODE panel with:
  - API URL display
  - "Reset Owner Password" button
  - Debug info showing reset/login results
- Force password change is enforced on first login

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind CSS + Shadcn/UI
- Authentication: JWT with role-based access control
