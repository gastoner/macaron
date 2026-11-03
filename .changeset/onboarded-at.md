---
"@open-macaron/contracts": minor
"@open-macaron/controller": minor
---

`GET /v1/me` says when the user closed the web app's onboarding (`onboardedAt`, null until then), and `PUT /v1/me/onboarding` records it, keeping the first time. Existing accounts count as onboarded.
