// Admin users have full access to all pages
export const ADMIN_EMAILS = [
  'rparthiban1612@gmail.com',
];

// Regular users can only access limited pages
export const AUTHORIZED_EMAILS = [
  'rparthiban1612@gmail.com',
  'rparthiban198@gmail.com',
  'parthi.webdev@gmail.com',
];

// Pages that regular (non-admin) users can access
export const LIMITED_ACCESS_PAGES = [
  '/create-order',
  '/orders',
  '/settings',
];

// Check if an email is authorized to login
export const isEmailAuthorized = (email) => {
  return AUTHORIZED_EMAILS.includes(email?.toLowerCase());
};

// Check if an email is an admin
export const isAdmin = (email) => {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
};

// Check if a user can access a specific page
export const canAccessPage = (email, pathname) => {
  // Admins can access everything
  if (isAdmin(email)) {
    return true;
  }

  // Non-admins can only access limited pages
  // Check if pathname starts with any of the limited access pages
  return LIMITED_ACCESS_PAGES.some(page =>
    pathname === page || pathname.startsWith(page + '/')
  );
};
