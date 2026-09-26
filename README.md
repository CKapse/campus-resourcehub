# Campus ResourceHub

## Student Resource Request & Allocation System

Campus ResourceHub is a lightweight web application that allows students to request campus resources and track allocation statuses in real time.

## Features

- Interactive resource request submission form
- Dynamic status tracking (Pending, Approved, Rejected, Issued, Returned)
- Live inventory overview and input validation
- Public JSON API (`/api/requests`)
- Continuous health monitoring (`/health`)
- Live Git commit tracking via footer badge
- Comprehensive automated test suite (`node:test`)
- Static analysis via ESLint
- Multi-stage Docker containerization
- GitHub Actions CI/CD automation
- Zero-downtime deployment to Render via deploy hooks

## Technology Stack

- **Runtime:** Node.js 22
- **Framework:** Express
- **Testing:** Node.js native test runner (`node:test`)
- **Linting:** ESLint
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Hosting:** Render

## Local Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/CKapse/campus-resourcehub.git](https://github.com/CKapse/campus-resourcehub.git)
   cd campus-resourcehub