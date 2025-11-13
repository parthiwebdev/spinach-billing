// Authorized user emails for the application
export const AUTHORIZED_EMAILS = [
  'rparthiban198@gmail.com',
  'rparthiban1612@gmail.com',
  'parthi.webdev@gmail.com',
];

// Check if an email is authorized
export const isEmailAuthorized = (email) => {
  return AUTHORIZED_EMAILS.includes(email?.toLowerCase());
};
