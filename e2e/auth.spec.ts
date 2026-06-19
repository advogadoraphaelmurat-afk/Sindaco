import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page by default', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Acessar Plataforma')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should fail with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Assumindo que a aplicação exibe uma mensagem de erro na tela
    const errorMsg = page.locator('.text-red-200');
    await expect(errorMsg).toBeVisible();
  });
});
