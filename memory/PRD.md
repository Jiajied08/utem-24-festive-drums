# UTeM 24 Festive Drum Club - Product Requirements Document

## Original Problem Statement
Build a modern, responsive official website for "UTeM 24 Festive Drum Club" (UTeM 二十四节令鼓队), a university 24 Festive Drums team established in 2011.

Main purposes:
1. Introduce the club and its history
2. Showcase performances, achievements and team activities
3. Allow organisations to view performance packages
4. Submit performance invitation/quotation requests
5. Recruit new UTeM students

## Architecture & Tech Stack
- **Backend**: FastAPI + Motor (async MongoDB) + Emergent Object Storage + Emergent Google OAuth
- **Frontend**: React 19 + React Router + Framer Motion + TailwindCSS + Shadcn UI
- **Design**: Deep maroon (#410C09), muted gold (#D4AF37), warm beige (#F5F1E7)
- **Typography**: Cormorant Garamond (headings), Manrope (body), Noto Serif/Sans SC (Chinese)
- **Bilingual**: English (default) + Simplified Chinese with EN/中文 switcher

## User Personas
- **Event Organizers**: Companies/organizations wanting to book drum performances
- **UTeM Students**: Prospective members interested in joining the club
- **Club Committee**: Admin users managing website content (Google OAuth)
- **Visitors**: General public interested in learning about 24 Festive Drums

## Core Requirements (Static)
1. Bilingual website (EN/中文)
2. Cinematic, culturally-inspired design
3. Sticky navigation with smooth scrolling
4. Fully responsive (desktop, tablet, mobile)
5. SEO-friendly with Open Graph metadata
6. Editable content via admin dashboard

## What's Been Implemented (2026-02-XX)
### Marketing Site (Public)
- ✅ Home page with cinematic hero, statistics (15+ Years, 50+ Performances, 30+ Members), intro section, gallery preview, CTA
- ✅ About page with mission, values (Culture, Discipline, Teamwork, Leadership)
- ✅ History page with vertical timeline (2011, 2025, 2026, Present)
- ✅ Performances page with gallery + category filters + lightbox
- ✅ Packages page with 3-tier pricing + enquiry form (14 fields) + file upload + WhatsApp buttons
- ✅ Team page (empty state until members added)
- ✅ Contact page with WhatsApp anchor links + Join Us registration form
- ✅ Sticky Navbar with EN/中文 language switcher
- ✅ Footer with contact info, social media links, copyright

### Backend API
- ✅ Emergent Google OAuth authentication (`/api/auth/session`, `/api/auth/me`, `/api/auth/logout`)
- ✅ Object storage integration for image uploads
- ✅ CRUD endpoints for: club-info, history, gallery, packages, enquiries, achievements, team, settings, join-us
- ✅ File upload endpoints for gallery, enquiries, achievements, team photos
- ✅ Session-based auth with 7-day expiry

### Admin Dashboard
- ✅ Google OAuth login flow (auth.emergentagent.com)
- ✅ Protected route with session verification
- ✅ Admin dashboard with statistics cards
- ✅ Sidebar navigation to all admin sections

### Integrations
- ✅ Emergent Object Storage (for image uploads)
- ✅ Emergent Google OAuth (for admin auth)
- ✅ WhatsApp direct links (wa.me format)

## Session Updates (2026-02-01)
- ✅ Removed stats-section (Years/Performances/Members counters) from Home.jsx and pruned unused icon imports
- ✅ Added dynamic Hero Carousel on Home page (auto-rotates every 6s with arrows + dot navigation)
- ✅ New backend endpoints: `GET/POST/DELETE /api/hero-images` with object storage
- ✅ New admin page `/admin/hero` — drag & drop upload, caption EN/中文, delete
- ✅ Cleaned unused imports (Users, Award, Calendar) in Home.jsx
- ✅ Backend CRUD verified via curl (POST → GET → files → DELETE all 200)
- ✅ Replaced Emergent OAuth with email/password login (`POST /api/auth/login`, bcrypt + session_token cookie)
- ✅ Seeded admin ding.jiae@gmail.com / Utem24Drum!
- ✅ Fixed Performance Booking nav to smooth-scroll (no page reload) + URL hash update
- ✅ Removed About page/route
- ✅ Booking section restyled to maroon (#410C09) + moved to bottom (under Instagram)
- ✅ Council page (/team) and nav link restored
- ✅ New `/admin/club-info` page — admin can edit homepage intro (about_en/about_zh), mission, and club numbers

## Test Results (Iteration 1)
- **Backend API**: ✅ All GET/POST endpoints passing (5/5 GET, 2/2 POST)
- **Frontend Pages**: ✅ All marketing routes load with content
- **Language Switcher**: ✅ EN/中文 toggle works
- **Forms**: ✅ Enquiry and Join Us forms accept submissions
- **Auth Protection**: ✅ 401 returned for unauthorized access
- **WhatsApp Links**: ✅ Fixed - anchor tags with wa.me URLs

## Prioritized Backlog

### P0 (Missing for Complete Admin)
- Admin: Club Info management page (edit statistics, about, mission text)
- Admin: History timeline management (add/edit/delete events)
- Admin: Gallery management (upload/categorize/delete images)
- Admin: Package management (edit pricing, duration, performers)
- Admin: Enquiry management with status updates and CSV export
- Admin: Achievement management (add/edit/delete with images)
- Admin: Team member management (add/edit with photo upload)
- Admin: Site settings management (contact info, social media)

### P1 (Enhancement)
- Instagram feed integration (may need workaround since Basic Display API deprecated)
- Email notifications for new enquiries (Resend integration)
- Admin: Join Us submissions view/export
- Enhanced SEO meta tags per page
- Sitemap.xml generation

### P2 (Nice to Have)
- Google Maps embed for location
- Video background support in hero
- Newsletter subscription
- Multi-admin role management

## Placeholders to Replace
1. **Contact Info**: Update captain/vice captain phone numbers in admin settings
2. **Statistics**: Edit performances count and members count in admin
3. **About/Mission Text**: Customize club story and mission via admin
4. **History Events**: Add real historical milestones with dates
5. **Package Prices**: Set actual pricing for Opening, Standard, Premium packages
6. **Gallery**: Upload real performance photos
7. **Team Members**: Add committee members with photos and bios
8. **Achievements**: Add competition results and milestones
9. **Social Media Links**: Add Facebook, TikTok URLs (Instagram already set)
10. **Email**: Update from placeholder to real club email
