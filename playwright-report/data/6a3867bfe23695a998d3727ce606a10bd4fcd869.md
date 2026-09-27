# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin_venues.spec.ts >> Admin_Venue_Management_CRUD_Operations >> Add a new venue and verify UI update
- Location: tests\e2e\admin_venues.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/admin" until "load"
  navigated to "http://localhost:3000/login"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Smart Attendance Portal" [level=1] [ref=e8]
      - paragraph [ref=e9]: Select your access role to proceed to the system
    - generic [ref=e10]:
      - button "Lecturer" [ref=e11] [cursor=pointer]
      - button "Admin" [ref=e17] [cursor=pointer]
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]: Administrator Email
        - textbox "admin@university.example" [ref=e24]: admin@example.com
      - generic [ref=e25]:
        - generic [ref=e26]: Password
        - textbox "••••••••" [ref=e27]: password
      - button "Authenticating..." [disabled] [ref=e28] [cursor=pointer]
    - paragraph [ref=e29]: Smart Attendance Enterprise System • Secured by Supabase JWT & FastAPI RBAC
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]
  - alert [ref=e39]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Admin_Venue_Management_CRUD_Operations', () => {
  4   |   test('Add a new venue and verify UI update', async ({ page }) => {
  5   |     // 1. Mock Supabase Auth
  6   |     await page.route('**/auth/v1/token*', route => {
  7   |       route.fulfill({
  8   |         status: 200,
  9   |         contentType: 'application/json',
  10  |         body: JSON.stringify({
  11  |           access_token: 'fake-jwt',
  12  |           token_type: 'bearer',
  13  |           expires_in: 3600,
  14  |           expires_at: Math.floor(Date.now() / 1000) + 3600,
  15  |           refresh_token: 'fake-refresh',
  16  |           user: { 
  17  |             id: 'admin-id', 
  18  |             aud: 'authenticated', 
  19  |             role: 'authenticated', 
  20  |             email: 'admin@example.com',
  21  |             app_metadata: { provider: 'email', providers: ['email'] },
  22  |             user_metadata: {},
  23  |             created_at: new Date().toISOString()
  24  |           }
  25  |         })
  26  |       });
  27  |     });
  28  | 
  29  |     // 2. Mock Backend User Profile
  30  |     await page.route('**/scheduling/users/me', route => {
  31  |       route.fulfill({
  32  |         status: 200,
  33  |         contentType: 'application/json',
  34  |         body: JSON.stringify({
  35  |           id: 'admin-id',
  36  |           role: 'admin',
  37  |           email: 'admin@example.com',
  38  |           status: 'active',
  39  |           is_active: true
  40  |         })
  41  |       });
  42  |     });
  43  | 
  44  |     // 3. Mock the initial venues fetch
  45  |     await page.route('**/scheduling/venues', async route => {
  46  |       if (route.request().method() === 'GET') {
  47  |         await route.fulfill({
  48  |           status: 200,
  49  |           contentType: 'application/json',
  50  |           body: JSON.stringify([
  51  |             { id: '1', name: 'Existing Venue', capacity: 50, location: 'Building A', boundary_data: { latitude: 0, longitude: 0, radius_meters: 10 } }
  52  |           ])
  53  |         });
  54  |       } else if (route.request().method() === 'POST') {
  55  |         const postData = JSON.parse(route.request().postData() || '{}');
  56  |         await route.fulfill({
  57  |           status: 201,
  58  |           contentType: 'application/json',
  59  |           body: JSON.stringify({
  60  |             id: '2',
  61  |             name: postData.name,
  62  |             capacity: postData.capacity,
  63  |             location: postData.location
  64  |           })
  65  |         });
  66  |       }
  67  |     });
  68  | 
  69  |     // 4. Perform Login
  70  |     await page.goto('/login');
  71  |     
  72  |     // Click the Admin tab and ensure React has processed the state change
  73  |     // Using expect().toPass() makes it resilient against Next.js hydration race conditions
  74  |     await expect(async () => {
  75  |       await page.getByRole('button', { name: /^Admin$/ }).click();
  76  |       await expect(page.getByRole('button', { name: 'Sign In as Admin' })).toBeVisible({ timeout: 1000 });
  77  |     }).toPass();
  78  | 
  79  |     await page.fill('input[type="email"]', 'admin@example.com');
  80  |     await page.fill('input[type="password"]', 'password');
  81  |     await page.getByRole('button', { name: 'Sign In as Admin' }).click();
  82  | 
  83  |     // 5. Wait for Next.js to route to the admin dashboard
> 84  |     await page.waitForURL('**/admin');
      |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  85  |     
  86  |     // Navigate to venues
  87  |     await page.goto('/admin/venues');
  88  | 
  89  |     // Click "Provision New Venue"
  90  |     const addVenueBtn = page.getByRole('button', { name: /Provision New Venue/i });
  91  |     await addVenueBtn.click();
  92  | 
  93  |     // Fill the form
  94  |     await page.locator('input[type="text"]').nth(0).fill('New Lecture Hall');
  95  |     await page.locator('input[type="number"]').nth(0).fill('100');
  96  |     await page.locator('input[type="text"]').nth(1).fill('Building B');
  97  | 
  98  |     // Submit the form
  99  |     await page.getByRole('button', { name: /Provision Venue/i }).click();
  100 | 
  101 |     // Verify that the UI updates the table correctly without page refreshes
  102 |     const newRow = page.getByText('New Lecture Hall');
  103 |     await expect(newRow).toBeVisible();
  104 |     
  105 |     const capacityCell = page.getByText('100');
  106 |     await expect(capacityCell).toBeVisible();
  107 |   });
  108 | });
  109 | 
```