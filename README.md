# Spinach Billing Application

A modern, full-featured billing and customer management system built with Next.js, Firebase, and Redux Toolkit. Designed specifically for spinach product businesses with real-time inventory, order management, and payment tracking.

## Features

- **Customer Management**: Track customers with pending balance and payment history
- **Order Management**: Create orders with automatic pending balance calculation
- **Payment Processing**: Record payments and update balances automatically
- **Product Catalog**: Manage spinach products (Fresh, Frozen, Organic)
- **Real-time Sync**: Firebase real-time updates across all devices
- **Bill Generation**: Clear bills showing current order + previous pending balance

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration.

Quick steps:
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy `.env.local.example` to `.env.local`
4. Add your Firebase credentials to `.env.local`

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Migrate Initial Data

Navigate to [http://localhost:3000/migrate](http://localhost:3000/migrate) and click "Migrate All"

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Frontend**: Next.js 15.1.0, React 19.2.0
- **Database**: Firebase Firestore
- **State**: Redux Toolkit + Redux Persist
- **UI**: Material-UI 7.3.5
- **Forms**: Formik + Yup
- **Auth**: Google OAuth

## Key Features

### Pending Balance System

When creating an order:
1. Enter customer phone number
2. System checks for existing customer
3. If found, displays previous pending balance
4. Bill shows: **Order Total + Previous Pending = Total Due**
5. Customer's balance updates automatically

### Payment Recording

Record payments at [/payments](http://localhost:3000/payments):
1. Select customer (shows current pending balance)
2. Enter payment amount
3. System automatically:
   - Creates payment record
   - Reduces customer's pending balance
   - Updates order status if applicable

## Project Structure

```
src/
├── app/               # Next.js pages
├── components/        # React components
├── store/slices/      # Redux slices with Firebase
├── services/          # Firebase CRUD operations
├── config/            # Firebase configuration
├── data/              # Mock data for migration
└── scripts/           # Migration scripts
```

## Documentation

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete Firebase setup guide with security rules
- [src/services/firebaseService.js](src/services/firebaseService.js) - Firebase API documentation

## Firestore Collections

- **customers**: Customer data with `pendingBalance`
- **products**: Product catalog
- **orders**: Orders with `totalWithPending`
- **payments**: Payment transactions with balance history

## Security

- Google OAuth authentication
- Email whitelist authorization
- Firebase security rules
- No deletions allowed (audit trail)
- Payment immutability

## Deployment

Deploy to Vercel:
```bash
npm run build
```

Add environment variables in Vercel dashboard.

## Support

For issues:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Review browser console for errors
3. Check Firebase Console for database errors

---

**Built with Next.js and Firebase** | Version 1.0.0
