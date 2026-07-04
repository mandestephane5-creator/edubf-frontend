# Sainte Marie — Frontend Web (Next.js)

Espace web réservé à l'administration et aux surveillants de l'école Sainte Marie.
Les parents utilisent exclusivement l'application mobile (voir `mobile/`).

## Stack
Next.js 14 (App Router) · React · Tailwind CSS

## Démarrage

```bash
cd frontend
cp .env.local.example .env.local   # vérifier NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Ouvre http://localhost:3000 — le backend doit tourner sur http://localhost:4000.

## Rôles

| Rôle | Accès |
|---|---|
| **ADMIN** (directrice) | Tout : gestion du personnel, classes, matières, paramètres, suppression |
| **SURVEILLANT** | Inscription élève+parent, notes, incidents, emploi du temps, évaluations |

Aucun accès parent ni élève sur le web — c'est le rôle de l'app mobile.

## Structure

```
src/app/
 ├── layout.js                 layout racine (fonts, AuthProvider)
 ├── page.js                   redirige vers /login ou /admin
 ├── (auth)/
 │   ├── login/page.js          email + mot de passe (staff uniquement)
 │   ├── register/page.js       créer une nouvelle école (onboarding)
 │   ├── forgot-password/       demande de réinitialisation par email
 │   └── reset-password/        définir un nouveau mot de passe (lien reçu par email)
 ├── admin/
 │   ├── page.js                 tableau de bord (stats, notifications)
 │   ├── students/                inscription combinée élève+parent, détection doublon téléphone
 │   ├── parents/                 liste, réinitialisation de mot de passe
 │   ├── classes/, subjects/       gestion classes et matières
 │   ├── grades/                   saisie rapide des notes
 │   ├── incidents/                journal mensuel (absence/retard/expulsion)
 │   ├── timetable/                grille emploi du temps (cliquer une case pour l'éditer)
 │   ├── evaluations/              devoirs par classe + jours de composition (école entière)
 │   ├── risk/                     élèves à risque (absences ou moyenne basse)
 │   ├── notifications/
 │   └── settings/                 paramètres école + gestion des comptes surveillant (admin)
 └── api-calls/                  tous les appels réseau vers le backend Express
src/
 ├── context/AuthContext.js
 └── components/                 DashboardShell (sidebar bleu roi), ui.js, Modal
```

## Comptes de démonstration (si le backend a été seedé)

- École : `sainte-marie`
- Admin : `directrice@saintemarie.bf` / `SainteMarie2026!`
- Surveillant : `surveillant@saintemarie.bf` / `Surveillant2026!`

## Design

Bleu roi (`#1E3AE8`) sur fond bleu très pâle (`#F4F6FF`), cartes pastel douces, logo blason.
