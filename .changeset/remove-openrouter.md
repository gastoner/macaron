---
"@open-macaron/controller": minor
---

OpenRouter is removed: Bifrost is the only LLM gateway, and its variables (`BIFROST_ADMIN_URL`, `BIFROST_PUBLIC_URL`, `BIFROST_ADMIN_PASSWORD`, `LLM_PRICING_FILE`) are required. `LLM_BACKEND` and the `OPENROUTER_*` variables are gone (a leftover value is ignored), and a migration drops `runs.key_backend`.
