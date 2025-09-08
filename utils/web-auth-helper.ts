// utils/web-auth-helper.ts
export const webLogin = async (email: string, password: string) => {
  const response = await fetch('/api/appwrite/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const session = await response.json();
  return session;
};