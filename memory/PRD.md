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
- Placeholder payment (save as pending, manual confirmation)
- JWT authentication with role-based access control
- MongoDB database with audit logging

## What's Been Implemented (January 2026)

### Public Website
- ✅ Homepage with healthcare hero image, trust line, featured campaigns
- ✅ Explicit EN|FR language toggle with localStorage persistence
- ✅ All 6 campaigns: 2 featured + 4 additional programs
- ✅ Donate page with campaign dropdown selector for all 6 campaigns
- ✅ Campaign-specific impact text per donation amount
- ✅ Transparency page with $0/$0 consistent counters (fresh start)
- ✅ FAQ page with accordion (8 questions EN/FR)
- ✅ Contact page with form, email, WhatsApp
- ✅ Thank You page with next steps
- ✅ Dynamic footer year

### Admin Panel
- ✅ JWT authentication with password change on first login
- ✅ Dev endpoint to reset owner password (POST /api/dev/reset-owner)
- ✅ Force password change enforcement on all protected routes
- ✅ Clear login error messages (User not found / Wrong password / User disabled)
- ✅ Dashboard with donation stats
- ✅ Campaigns management with featured flag and reordering
- ✅ Custom donation impact texts (EN/FR) per campaign
- ✅ Donations management with status change and CSV export
- ✅ Transparency reports management
- ✅ News updates management
- ✅ User management (Owner only)
- ✅ Settings management (Owner only)
- ✅ Audit logging for all changes

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
- Default temp password: Temp@12345! (after calling POST /api/dev/reset-owner)
- To reset password: POST https://[your-domain]/api/dev/reset-owner
- Force password change is enforced on first login

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind CSS + Shadcn/UI
- Authentication: JWT with role-based access control
