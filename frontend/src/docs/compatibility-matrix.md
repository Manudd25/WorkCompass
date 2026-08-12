# WorkCompass Compatibility Matrix

This redesign preserves backend and route contracts:

- Auth routes remain unchanged: `/api/auth/signup`, `/api/auth/login`, `/api/auth/google`, `/api/auth/profile`.
- Application CRUD routes remain unchanged: `/api/applications` and `/api/applications/:id`.
- Application status enum stays exactly: `Applied`, `Interview`, `Offer`, `Rejected`.
- Interview type enum stays exactly: `video`, `phone`, `in-person`.
- Wellness contracts remain unchanged: `/api/wellness/mood-entries` and `/api/wellness/assessments` CRUD.
- AI routes remain unchanged: `/api/ai/guest-chat`, `/api/ai/chat`, `/api/ai/insights/:applicationId`, `/api/ai/interview-prep/:applicationId`, `/api/ai/recommendations`.
- Existing routes remain accessible and compatible:
  - `/`, `/login`, `/signup`, `/dashboard`, `/applications`, `/applications/new`, `/applications/:id`
  - `/calendar`, `/settings`, `/wellness/monitoring`, `/wellness/resources`, `/community/forum`
- New additive views introduced without changing existing contracts:
  - `/analytics`
  - `/career-compass`
