# Fullerton Rotary — Test Plans

## What Is This?

Test scripts for the **Fullerton Rotary Club** platform. This includes a public-facing website, a member check-in kiosk, and an admin portal.

## Test Scripts (Priority Order)

| Priority | File | What It Tests |
|----------|------|---------------|
| 🔴 P1 | [member-checkin.md](./member-checkin.md) | Kiosk check-in at weekly lunch meetings |
| 🔴 P1 | [join-inquiry.md](./join-inquiry.md) | Membership inquiry form |
| 🟡 P2 | [public-website.md](./public-website.md) | Homepage, Events, Programs, About pages |
| 🟡 P2 | [admin-members.md](./admin-members.md) | Admin member management |
| 🟡 P2 | [admin-events.md](./admin-events.md) | Admin event management |
| 🟢 P3 | [uncorked-vendors.md](./uncorked-vendors.md) | Uncorked event vendor pages |

## Before You Start

- Public site: no login needed
- Admin pages require a Clerk login with admin/club_admin role
- Check-in kiosk: go to `/checkin` — requires an active meeting session (admin must start one)
- Test in Chrome desktop + mobile Safari or Android Chrome

## URLs

- Public site: `https://fullertonrotary.org/` (or local: `http://localhost:3001`)
- Check-in kiosk: `/checkin`
- Admin: `/admin`
- Join: `/join`
- Events: `/events`
