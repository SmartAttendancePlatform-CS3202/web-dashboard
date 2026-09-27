import { test, expect } from '@playwright/test';

test.describe('Admin_Venue_Management_CRUD_Operations', () => {
  test('Add a new venue and verify UI update', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // 1. Mock Supabase Auth
    await page.route('**/auth/v1/token*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJleHAiOiAyMDk5NzU1Njc4LCAic3ViIjogImFkbWluLWlkIiwgInJvbGUiOiAiYXV0aGVudGljYXRlZCJ9.fake',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'fake-refresh',
          user: { 
            id: 'admin-id', 
            aud: 'authenticated', 
            role: 'authenticated', 
            email: 'admin@example.com',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            created_at: new Date().toISOString()
          }
        })
      });
    });

    // 2. Mock Backend User Profile
    await page.route('**/scheduling/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin-id',
          role: 'admin',
          email: 'admin@example.com',
          status: 'active',
          is_active: true
        })
      });
    });

    // 3. Mock the initial venues fetch
    await page.route('**/scheduling/venues', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '1', name: 'Existing Venue', capacity: 50, location: 'Building A', boundary_data: { latitude: 0, longitude: 0, radius_meters: 10 } }
          ])
        });
      } else if (route.request().method() === 'POST') {
        const postData = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '2',
            name: postData.name,
            capacity: postData.capacity,
            location: postData.location
          })
        });
      }
    });

    // 4. Perform Login
    await page.context().addCookies([{ name: 'E2E_TEST', value: 'true', url: 'http://127.0.0.1:3000' }]);
    await page.goto('/login');
    
    // Click the Admin tab and ensure React has processed the state change
    // Using expect().toPass() makes it resilient against Next.js hydration race conditions
    await expect(async () => {
      await page.getByRole('button', { name: /^Admin$/ }).click();
      await expect(page.getByRole('button', { name: 'Sign In as Admin' })).toBeVisible({ timeout: 1000 });
    }).toPass();

    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.getByRole('button', { name: 'Sign In as Admin' }).click();

    // 5. Wait for Next.js to route to the admin dashboard
    await page.waitForURL('**/admin');
    
    // Navigate to venues
    await page.goto('/admin/venues');

    // Click "Provision New Venue"
    const addVenueBtn = page.getByRole('button', { name: /Provision New Venue/i });
    await addVenueBtn.click();

    // Fill the form
    await page.locator('input[type="text"]').nth(0).fill('New Lecture Hall');
    await page.locator('input[type="number"]').nth(0).fill('100');
    await page.locator('input[type="text"]').nth(1).fill('Building B');

    // Submit the form
    await page.getByRole('button', { name: /Provision Venue/i }).click();

    // Verify that the UI updates the table correctly without page refreshes
    const newRow = page.getByRole('heading', { name: 'New Lecture Hall' });
    await expect(newRow).toBeVisible();
    
    const capacityCell = page.getByText('100').first();
    await expect(capacityCell).toBeVisible();
  });
});
