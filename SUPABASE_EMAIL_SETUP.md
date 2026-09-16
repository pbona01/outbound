# Outbound Auth Email Setup

The branded confirmation template is in `supabase/templates/confirmation.html`.

Supabase does not load email templates or change the sender identity from application code. In Supabase Dashboard:

1. Authentication → Email Templates → Confirm signup: paste the template contents.
2. Authentication → SMTP Settings: configure a transactional provider such as Resend, Postmark, or SendGrid with an `outbound` sender address on your verified domain.
3. Authentication → URL Configuration: add the deployed Vercel URL to Site URL and Redirect URLs, including `/onboarding`.

The app now sends the confirmation redirect back to `/onboarding` after verification.
