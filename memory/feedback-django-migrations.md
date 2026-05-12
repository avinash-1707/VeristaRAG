---
name: feedback-django-migrations
description: User handles Django migrations themselves — never run makemigrations or migrate
metadata:
  type: feedback
---

Do NOT run `python manage.py makemigrations` or `python manage.py migrate`. User runs these themselves.

**Why:** User preference — they want control over when and how DB migrations run.
**How to apply:** Write model files and note migration step, but stop there. Never execute Django management commands for migrations.
