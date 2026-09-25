import { test, expect } from '@playwright/test';

test.describe('ServiceHub E2E Test Suite', () => {
  test('Test 1: Login and verify Dashboard metrics', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=SERVICEHUB')).toBeVisible();

    await page.fill('#email', 'admin@servicehub.com');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("ENTER SYSTEM")');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=CONTROL ROOM OPERATIONS')).toBeVisible();
    await expect(page.locator('text=TOTAL CUSTOMERS')).toBeVisible();
    await expect(page.locator('text=OPEN REQUESTS')).toBeVisible();
  });

  test('Test 2: Create new customer account', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@servicehub.com');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("ENTER SYSTEM")');

    await page.click('a:has-text("Customers")');
    await expect(page).toHaveURL('/customers');

    await page.click('button:has-text("ADD NEW CUSTOMER")');
    await page.fill('#name', 'Playwright Test Client');
    await page.fill('#email', 'pwtest@client.com');
    await page.fill('#phone', '+1-555-7777');
    await page.fill('#address', '99 Automated Way, Silicon Valley CA');
    await page.click('button:has-text("CREATE CUSTOMER")');

    await expect(page.locator('text=Playwright Test Client')).toBeVisible();
  });

  test('Test 3: Submit service request', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@servicehub.com');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("ENTER SYSTEM")');

    await page.click('a:has-text("Service Requests")');
    await expect(page).toHaveURL('/requests');

    await page.click('button:has-text("NEW SERVICE REQUEST")');
    await page.fill('#title', 'Automated E2E Audit');
    await page.fill('textarea', 'Verifying request submission via Playwright');
    await page.click('button:has-text("SUBMIT REQUEST")');

    await expect(page.locator('text=Automated E2E Audit')).toBeVisible();
  });

  test('Test 4: Update request status', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@servicehub.com');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("ENTER SYSTEM")');

    await page.click('a:has-text("Service Requests")');
    await expect(page).toHaveURL('/requests');

    // Click update on first row
    const firstRowUpdate = page.locator('button:has-text("UPDATE")').first();
    await firstRowUpdate.click();

    await page.selectOption('#update_status', 'IN_PROGRESS');
    await page.click('button:has-text("SAVE CHANGES")');

    await expect(page.locator('text=IN PROGRESS').first()).toBeVisible();
  });
});
