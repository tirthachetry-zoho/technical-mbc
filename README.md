# PDF Store — Next.js PDF E-Commerce Platform

A production-ready PDF e-commerce platform built with Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Cloudflare R2, Razorpay, and Auth.js.

## Features

### Core Functionality
- **Public Catalog** - Browse products via home page and product detail pages
- **User Authentication** - Secure login/signup with Auth.js (Admin & Customer roles)
- **Shopping Cart** - Add/remove products, view cart summary
- **Checkout Flow** - Razorpay integration for secure payments
- **Order Management** - Track orders with status updates
- **Secure Downloads** - Time-limited signed URLs for purchased PDFs
- **Admin Dashboard** - Manage products, orders, customers, and analytics

### Admin Features
- Product CRUD operations with PDF upload to R2
- Order management and status updates
- Customer management
- Category management
- Coupon/discount code support
- Review moderation
- Import/export functionality

### Technical Highlights
- Server-side PDF storage (never publicly accessible)
- Download tracking with IP/User-Agent logging
- Max download limits per order
- Coupon logic (percentage/flat discount, expiry, usage limits)
- Full Prisma schema covering all data models

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| Storage | Cloudflare R2 |
| Payments | Razorpay |
| Auth | Auth.js (NextAuth) |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure environment variables (see below)

# Push database schema
npx prisma db push

# Seed demo data (optional)
# Set SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_STUDENT_EMAIL, SEED_STUDENT_PASSWORD in .env to customize
npm run db:seed

# Start development server
npm run dev
```

Visit:
- Storefront: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin Panel: `http://localhost:3000/admin`

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for session encryption |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET` | R2 bucket name |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (client-side) |
| `DOWNLOAD_TOKEN_SECRET` | Secret for generating download tokens |
| `SEED_ADMIN_EMAIL` | Admin email used when running `db:seed` |
| `SEED_ADMIN_PASSWORD` | Admin password used when running `db:seed` |
| `SEED_STUDENT_EMAIL` | Sample student email used when running `db:seed` |
| `SEED_STUDENT_PASSWORD` | Sample student password used when running `db:seed` |

See `.env.example` for a complete template.

## Project Structure

```
pdf-store/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard routes
│   ├── api/               # API routes
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout flow
│   ├── products/          # Product listing & details
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── r2.ts             # R2 storage client
│   ├── razorpay.ts       # Payment integration
│   ├── auth.ts           # Auth configuration
│   └── ...
├── prisma/
│   └── schema.prisma     # Database schema
└── types/                 # TypeScript type definitions
```

## Deployment

### Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables in Project Settings
4. Vercel automatically runs `prisma generate` during build
5. Run migrations: `npx prisma db push`
6. Seed data if needed: `npm run db:seed`

### Self-Hosted
1. Set up PostgreSQL database
2. Configure Cloudflare R2 bucket
3. Set all environment variables
4. Run `npx prisma db push`
5. Start server: `npm run start`

## License

MIT

---

Built with ❤️ for digital content sellers