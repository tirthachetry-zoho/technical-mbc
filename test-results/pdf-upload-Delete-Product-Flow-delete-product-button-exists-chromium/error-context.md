# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pdf-upload.spec.ts >> Delete Product Flow >> delete product button exists
- Location: e2e/pdf-upload.spec.ts:242:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import path from "path";
  3   | 
  4   | // Helper: login as admin
  5   | async function loginAsAdmin(page: any): Promise<void> {
  6   |   const email = process.env.SEED_ADMIN_EMAIL || "admin@test.com";
  7   |   const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
> 8   |   await page.goto("/login");
      |              ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  9   |   await page.getByPlaceholder("you@example.com").fill(email);
  10  |   await page.getByPlaceholder("••••••••").fill(password);
  11  |   await page.getByRole("button", { name: /login/i }).click();
  12  |   await page.waitForTimeout(2000);
  13  | }
  14  | 
  15  | // ============================================================
  16  | // PUBLIC PAGES
  17  | // ============================================================
  18  | test.describe("Public Pages", () => {
  19  |   test("homepage loads correctly", async ({ page }) => {
  20  |     const response = await page.goto("/");
  21  |     expect(response?.status()).toBe(200);
  22  |     await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  23  |   });
  24  | 
  25  |   test("products page loads", async ({ page }) => {
  26  |     const response = await page.goto("/products");
  27  |     expect(response?.status()).toBe(200);
  28  |     await expect(page.locator("text=Something went wrong")).not.toBeVisible();
  29  |   });
  30  | 
  31  |   test("login page loads", async ({ page }) => {
  32  |     await page.goto("/login");
  33  |     await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
  34  |   });
  35  | });
  36  | 
  37  | // ============================================================
  38  | // ADMIN AUTHENTICATION
  39  | // ============================================================
  40  | test.describe("Admin Authentication", () => {
  41  |   test("login page renders form", async ({ page }) => {
  42  |     await page.goto("/login");
  43  |     await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  44  |     await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  45  |     await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
  46  |   });
  47  | 
  48  |   test("login with invalid credentials shows error", async ({ page }) => {
  49  |     await page.goto("/login");
  50  |     await page.getByPlaceholder("you@example.com").fill("wrong@test.com");
  51  |     await page.getByPlaceholder("••••••••").fill("wrongpassword");
  52  |     await page.getByRole("button", { name: /login/i }).click();
  53  |     await expect(page.locator("text=Invalid email or password")).toBeVisible({ timeout: 10_000 });
  54  |   });
  55  | });
  56  | 
  57  | // ============================================================
  58  | // ADD PRODUCT (PDF Upload)
  59  | // ============================================================
  60  | test.describe("Add Product - PDF Upload Flow", () => {
  61  |   test("new product page loads without headers() error", async ({ page }) => {
  62  |     await loginAsAdmin(page);
  63  |     
  64  |     const response = await page.goto("/admin/products/new");
  65  |     expect(response?.status()).toBe(200);
  66  |     
  67  |     // Should NOT show the "Something went wrong" error
  68  |     await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 10_000 });
  69  |     await expect(page.locator("text=An error occurred")).not.toBeVisible();
  70  |     await expect(page.locator("text=Try again")).not.toBeVisible();
  71  |     
  72  |     // The form should be visible
  73  |     await expect(page.getByRole("heading", { name: /new product/i })).toBeVisible({ timeout: 10_000 });
  74  |   });
  75  | 
  76  |   test("product form has all required fields", async ({ page }) => {
  77  |     await loginAsAdmin(page);
  78  |     await page.goto("/admin/products/new");
  79  |     await expect(page.getByRole("heading", { name: /new product/i })).toBeVisible({ timeout: 10_000 });
  80  | 
  81  |     // Check form fields exist
  82  |     await expect(page.locator('input[name="title"]')).toBeVisible();
  83  |     await expect(page.locator('textarea[name="description"]')).toBeVisible();
  84  |     await expect(page.locator('select[name="categoryId"]')).toBeVisible();
  85  |     await expect(page.locator('input[name="thumbnailUrl"]')).toBeVisible();
  86  |     await expect(page.locator('input[name="thumbnailFile"]')).toBeVisible();
  87  |     await expect(page.locator('input[name="language"]')).toBeVisible();
  88  |     await expect(page.locator('input[name="pages"]')).toBeVisible();
  89  |     
  90  |     // PDF file input
  91  |     await expect(page.locator('input[name="pdf"]')).toBeVisible();
  92  |     
  93  |     // Create button
  94  |     await expect(page.getByRole("button", { name: /create product/i })).toBeVisible();
  95  |   });
  96  | 
  97  |   test("PDF file input accepts PDF files", async ({ page }) => {
  98  |     await loginAsAdmin(page);
  99  |     await page.goto("/admin/products/new");
  100 |     await expect(page.getByRole("heading", { name: /new product/i })).toBeVisible({ timeout: 10_000 });
  101 | 
  102 |     // Upload a test PDF file
  103 |     const pdfPath = path.join(__dirname, "..", "files", "TechnicalMBC Final English and Bengali Language.pdf");
  104 |     const fileInput = page.locator('input[name="pdf"]');
  105 |     await fileInput.setInputFiles(pdfPath);
  106 |     
  107 |     // Verify no error appeared
  108 |     await expect(page.locator("text=Something went wrong")).not.toBeVisible();
```