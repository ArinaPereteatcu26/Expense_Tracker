export const claimReq = {
  adminOnly: (c: any) => c.role == 'Admin',
  user: (c: any) => c.role == 'User',
  guest: (c: any) => c.role == 'Guest',
};
