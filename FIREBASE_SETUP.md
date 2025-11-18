# Firebase Setup Guide for Spinach Billing

This guide will help you set up Firebase for your Spinach Billing application.

## Table of Contents
1. [Create Firebase Project](#create-firebase-project)
2. [Configure Firebase in Your App](#configure-firebase-in-your-app)
3. [Set Up Firestore Database](#set-up-firestore-database)
4. [Configure Security Rules](#configure-security-rules)
5. [Migrate Data](#migrate-data)
6. [Initialize Firebase Listeners](#initialize-firebase-listeners)

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "spinach-billing")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Configure Firebase in Your App

### Step 1: Add Web App to Firebase Project

1. In Firebase Console, click the gear icon (Project Settings)
2. Scroll down to "Your apps" section
3. Click the Web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "Spinach Billing Web")
5. Copy the Firebase configuration object

### Step 2: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

## Set Up Firestore Database

### Step 1: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in **production mode**" (we'll add security rules next)
4. Select a Cloud Firestore location (choose closest to your users)
5. Click "Enable"

### Step 2: Create Collections

The application will automatically create the following collections when you migrate data:
- `customers` - Customer information and balances
- `products` - Spinach product catalog
- `orders` - Customer orders with pending balance tracking
- `payments` - Payment transaction history

## Configure Security Rules

In Firebase Console, go to "Firestore Database" > "Rules" and paste the following:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is authorized
    function isAuthorized() {
      return isAuthenticated() &&
             request.auth.token.email in [
               'rparthiban198@gmail.com',
               'rparthiban1612@gmail.com',
               'parthi.webdev@gmail.com'
             ];
    }

    // Customers collection
    match /customers/{customerId} {
      allow read: if isAuthorized();
      allow create: if isAuthorized();
      allow update: if isAuthorized();
      allow delete: if false; // Prevent deletion
    }

    // Products collection
    match /products/{productId} {
      allow read: if isAuthorized();
      allow create: if isAuthorized();
      allow update: if isAuthorized();
      allow delete: if false; // Prevent deletion
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthorized();
      allow create: if isAuthorized();
      allow update: if isAuthorized();
      allow delete: if false; // Prevent deletion
    }

    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthorized();
      allow create: if isAuthorized();
      allow update: if false; // Payments should not be modified
      allow delete: if false; // Prevent deletion
    }
  }
}
\`\`\`

Click "Publish" to save the rules.

### Security Rules Explanation

- **Authentication Required**: All operations require a logged-in user
- **Authorization**: Only whitelisted email addresses can access data
- **Read Access**: Authorized users can read all documents
- **Write Access**: Authorized users can create and update documents
- **Delete Prevention**: No one can delete documents (data preservation)
- **Payment Immutability**: Payments cannot be updated after creation (audit trail)

## Migrate Data

### Step 1: Run Migration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the migration page:
   ```
   http://localhost:3000/migrate
   ```

3. Click "Migrate All" to migrate:
   - 10 spinach products
   - 10 sample customers (with `pendingBalance: 0`)

### Step 2: Verify Data

1. Go to Firebase Console > Firestore Database
2. Verify that `customers` and `products` collections are populated
3. Check that customer documents have the `pendingBalance` field

## Initialize Firebase Listeners

The application automatically initializes real-time listeners when the app loads. However, you need to add the initialization code to your root layout or a top-level component.

### Option 1: Add to Root Layout (Recommended)

Edit `/media/nsroot5/dev/my-projects/my-react/spinach-billing/src/app/client-layout.js`:

\`\`\`javascript
'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeCustomersListener } from '@/store/slices/customersSlice';
import { initializeProductsListener } from '@/store/slices/productsSlice';
import { initializeOrdersListener } from '@/store/slices/ordersSlice';
import { initializePaymentsListener } from '@/store/slices/paymentsSlice';

export default function ClientLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize all Firebase real-time listeners
    dispatch(initializeCustomersListener());
    dispatch(initializeProductsListener());
    dispatch(initializeOrdersListener());
    dispatch(initializePaymentsListener());
  }, [dispatch]);

  return <>{children}</>;
}
\`\`\`

### Option 2: Create a Separate Component

Create `/media/nsroot5/dev/my-projects/my-react/spinach-billing/src/components/FirebaseInitializer.js` and add it to your layout.

## Testing the Integration

### 1. Test Customer Creation & Order Flow

1. Go to `/products` and add items to cart
2. Go to `/checkout`
3. Enter a phone number (e.g., `1234567890`)
4. Fill in customer details
5. Submit order
6. Verify in Firebase Console:
   - New customer created in `customers` collection
   - New order created in `orders` collection
   - Customer's `pendingBalance` updated

### 2. Test Payment Recording

1. Go to `/payments`
2. Select a customer with pending balance
3. Enter payment amount
4. Submit payment
5. Verify in Firebase Console:
   - New payment record in `payments` collection
   - Customer's `pendingBalance` reduced
   - Payment history shows `previousBalance` and `newBalance`

### 3. Test Real-time Updates

1. Open the app in two browser tabs
2. In tab 1, record a payment
3. In tab 2, the customer's balance should update automatically (real-time!)

## Firestore Data Structure

### Customers Collection
\`\`\`javascript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  address: "123 Main St",
  city: "Mumbai",
  zipCode: "400001",
  pendingBalance: 150.50,
  totalSpent: 5000.00,
  totalOrders: 10,
  status: "Active",
  joinedDate: "2025-01-15T10:30:00Z",
  avatar: "https://...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

### Products Collection
\`\`\`javascript
{
  name: "Spinach",
  category: "Fresh",
  price: 45.00,
  unit: "bunch",
  description: "Fresh spinach...",
  image: "https://...",
  inStock: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

### Orders Collection
\`\`\`javascript
{
  orderNumber: "ORD-1234567890",
  customerId: "customerId123",
  customerInfo: { name, email, phone, ... },
  items: [
    {
      productId: "prod123",
      name: "Spinach",
      price: 45.00,
      quantity: 2,
      unit: "bunch"
    }
  ],
  subtotal: 90.00,
  tax: 0,
  shipping: 0,
  total: 90.00,
  previousPendingBalance: 60.50,
  totalWithPending: 150.50,
  status: "Unpaid", // "Paid", "PartiallyPaid", "Unpaid"
  paidAmount: 0,
  date: "2025-01-15T10:30:00Z",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

### Payments Collection
\`\`\`javascript
{
  customerId: "customerId123",
  orderId: "orderId456", // optional
  amountPaid: 100.00,
  paymentMethod: "Cash",
  notes: "Payment received",
  previousBalance: 150.50,
  newBalance: 50.50,
  paymentDate: Timestamp,
  createdAt: Timestamp
}
\`\`\`

## Troubleshooting

### Issue: "Permission denied" errors

**Solution**:
1. Check that you're logged in with an authorized email
2. Verify security rules are published
3. Add your email to the authorized list in security rules

### Issue: Data not updating in real-time

**Solution**:
1. Check that Firebase listeners are initialized
2. Verify your Firebase configuration is correct
3. Check browser console for errors

### Issue: Migration fails

**Solution**:
1. Verify `.env.local` has correct Firebase config
2. Check that Firestore is enabled in Firebase Console
3. Verify you have write permissions (logged in with authorized email)

## Next Steps

1. **Customize authorized users**: Update security rules with your team's email addresses
2. **Add indexes**: Firebase will prompt you to create indexes as you use complex queries
3. **Monitor usage**: Check Firebase Console > Usage to monitor Firestore reads/writes
4. **Backup data**: Set up automated backups in Firebase Console > Firestore > Backups

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration in `.env.local`
3. Review Firestore security rules
4. Check Firebase Console > Firestore > Usage for any quota limits
