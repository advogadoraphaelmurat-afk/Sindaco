import { test, expect } from '@playwright/test';
import * as auth from '../lib/auth';

test('verify token contains buildingId', async () => {
  const payload = {
    userId: '123',
    role: 'SINDICO',
    buildingId: 'abc',
    email: 'sindico@aurora.com',
  };
  const token = await auth.encrypt(payload);
  const decrypted = await auth.decrypt(token);
  console.log('Decrypted:', decrypted);
});
