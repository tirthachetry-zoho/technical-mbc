# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pdf-upload.spec.ts >> Download Flow >> download page route exists
- Location: e2e/pdf-upload.spec.ts:292:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/download/test-order-id", waiting until "load"

```

# Test source

```ts
  193 |     
  194 |     await expect(page.getByRole("heading", { name: /edit product/i })).toBeVisible({ timeout: 10_000 });
  195 |     
  196 |     // Get original title for verification
  197 |     const originalTitle = await page.locator('input[name="title"]').inputValue();
  198 |     
  199 |     // Update the title
  200 |     await page.locator('input[name="title"]').fill(`${originalTitle} (Updated)`);
  201 |     
  202 |     // Submit the form
  203 |     await page.getByRole("button", { name: /update product/i }).click();
  204 |     
  205 |     // Should redirect back to products list
  206 |     await page.waitForURL("**/admin/products**", { timeout: 15_000 });
  207 |     
  208 |     // Verify updated title appears
  209 |     await expect(page.locator(`text=${originalTitle} (Updated)`)).toBeVisible({ timeout: 10_000 });
  210 |   });
  211 | 
  212 |   test("toggle publish/unpublish status", async ({ page }) => {
  213 |     await loginAsAdmin(page);
  214 |     await page.goto("/admin/products");
  215 |     
  216 |     // Find first product row
  217 |     const firstRow = page.locator('tbody tr').first();
  218 |     await expect(firstRow).toBeVisible({ timeout: 10_000 });
  219 |     
  220 |     // Get current status
  221 |     const statusBadge = firstRow.locator('td:nth-child(4) span.badge');
  222 |     const currentStatus = (await statusBadge.textContent()).trim() || "";
  223 |     
  224 |     // Click publish/unpublish button using getByRole with specific name pattern
  225 |     // This avoids strict mode conflicts with the Delete button in the same row
  226 |     const toggleBtn = page.getByRole('button', { name: currentStatus.includes("Published") ? "Unpublish" : "Publish" }).first();
  227 |     await toggleBtn.click();
  228 |     
  229 |     // Wait for page reload and check new status
  230 |     await page.waitForLoadState("networkidle");
  231 |     const newStatus = (await statusBadge.textContent()).trim() || "";
  232 |     
  233 |     // Status should have changed
  234 |     expect(newStatus).not.toBe(currentStatus);
  235 |   });
  236 | });
  237 | 
  238 | // ============================================================
  239 | // DELETE PRODUCT
  240 | // ============================================================
  241 | test.describe("Delete Product Flow", () => {
  242 |   test("delete product button exists", async ({ page }) => {
  243 |     await loginAsAdmin(page);
  244 |     await page.goto("/admin/products");
  245 |     
  246 |     // First product row should have delete button
  247 |     const firstRow = page.locator('tbody tr').first();
  248 |     await expect(firstRow).toBeVisible({ timeout: 10_000 });
  249 |     
  250 |     const deleteBtn = firstRow.locator('form button:text("Delete")');
  251 |     await expect(deleteBtn).toBeVisible();
  252 |   });
  253 | 
  254 |   test("can delete a product", async ({ page }) => {
  255 |     await loginAsAdmin(page);
  256 |     await page.goto("/admin/products");
  257 |     
  258 |     // First, create a product we know exists and can safely delete
  259 |     const uniqueTitle = `Delete Me ${Date.now()}`;
  260 |     await page.locator('input[name="title"]').fill(uniqueTitle);
  261 |     await page.locator('textarea[name="description"]').fill("Will be deleted");
  262 |     await page.locator('select[name="categoryId"]').selectOption({ index: 0 });
  263 |     await page.locator('input[name="price"]').fill("100");
  264 |     await page.locator('input[name="language"]').fill("English");
  265 |     await page.locator('input[name="pages"]').fill("10");
  266 |     await page.locator('input[name="thumbnailUrl"]').fill("https://placehold.co/200x240/png?text=Delete");
  267 |     await page.getByRole("button", { name: /create product/i }).click();
  268 |     await page.waitForURL("**/admin/products**", { timeout: 15_000 });
  269 |     await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible({ timeout: 10_000 });
  270 |     
  271 |     // Now find and delete this specific product
  272 |     const deleteLink = page.locator(`tr:has-text("${uniqueTitle}")`).first();
  273 |     await expect(deleteLink).toBeVisible({ timeout: 10_000 });
  274 |     
  275 |     // Get the row and click delete
  276 |     const row = page.locator(`tr:has-text("${uniqueTitle}")`).first();
  277 |     const deleteBtn = row.locator('form:has(button:text("Delete"))').locator('button');
  278 |     await deleteBtn.click();
  279 |     
  280 |     // Wait for page reload
  281 |     await page.waitForLoadState("networkidle");
  282 |     
  283 |     // Product should no longer appear
  284 |     await expect(page.locator(`text=${uniqueTitle}`)).not.toBeVisible({ timeout: 10_000 });
  285 |   });
  286 | });
  287 | 
  288 | // ============================================================
  289 | // DOWNLOAD FLOW
  290 | // ============================================================
  291 | test.describe("Download Flow", () => {
  292 |   test("download page route exists", async ({ page }) => {
> 293 |     await page.goto("/download/test-order-id");
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  294 |     // Should not show "Something went wrong" error
  295 |     await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 10_000 });
  296 |   });
  297 | 
  298 |   test("dashboard downloads page loads", async ({ page }) => {
  299 |     await page.goto("/dashboard/downloads");
  300 |     // Should not crash with headers() error
  301 |     await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 10_000 });
  302 |   });
  303 | 
  304 |   test("download API route responds", async ({ request }) => {
  305 |     // Should return 404 for non-existent order, not crash
  306 |     const response = await request.get("/api/download/non-existent-order");
  307 |     // Either 404 or proper error response is acceptable
  308 |     expect([404, 400, 500]).toContain(response.status());
  309 |   });
  310 | });
  311 | 
  312 | // ============================================================
  313 | // CHECKOUT & PAYMENT VERIFICATION
  314 | // ============================================================
  315 | test.describe("Checkout & Payment Flow", () => {
  316 |   test("checkout page loads", async ({ page }) => {
  317 |     await page.goto("/checkout");
  318 |     await expect(page.locator("text=Something went wrong")).not.toBeVisible({ timeout: 10_000 });
  319 |   });
  320 | 
  321 |   test("checkout API responds with proper validation", async ({ request }) => {
  322 |     // Test with missing required field (productIds) - returns 401 since auth middleware runs first
  323 |     const response1 = await request.post("/api/checkout", {
  324 |       data: {},
  325 |     });
  326 |     // Auth middleware runs first, so we get 401 for unauthenticated requests
  327 |     expect([400, 401]).toContain(response1.status());
  328 | 
  329 |     // Test with valid structure but non-existent product - also hits auth first
  330 |     const response2 = await request.post("/api/checkout", {
  331 |       data: {
  332 |         productIds: ["00000000-0000-0000-0000-000000000001"],
  333 |       },
  334 |     });
  335 |     // Auth middleware runs first for unauthenticated requests
  336 |     expect([200, 400, 401, 404]).toContain(response2.status());
  337 |   });
  338 | 
  339 |   test("payment verification API handles invalid data gracefully", async ({ request }) => {
  340 |     const response = await request.post("/api/payments/verify", {
  341 |       data: {
  342 |         orderId: "non-existent",
  343 |         razorpay_order_id: "fake_order",
  344 |         razorpay_payment_id: "fake_payment",
  345 |         razorpay_signature: "fake_signature",
  346 |       },
  347 |     });
  348 |     // Should return 400 (invalid signature), 404 (order not found), or 500 (Prisma error - not ideal but not a crash)
  349 |     expect([400, 404, 500]).toContain(response.status());
  350 |   });
  351 | });
  352 | 
  353 | // ============================================================
  354 | // API ROUTES
  355 | // ============================================================
  356 | test.describe("API Routes", () => {
  357 |   test("products API returns data", async ({ request }) => {
  358 |     const response = await request.get("/api/products");
  359 |     expect(response.status()).toBe(200);
  360 |     const data = await response.json();
  361 |     expect(Array.isArray(data)).toBe(true);
  362 |   });
  363 | 
  364 |   test("categories API returns data", async ({ request }) => {
  365 |     const response = await request.get("/api/categories");
  366 |     expect(response.status()).toBe(200);
  367 |   });
  368 | 
  369 |   test("wishlist API responds", async ({ request }) => {
  370 |     const response = await request.get("/api/wishlist");
  371 |     // 401 for unauthenticated is fine
  372 |     expect([200, 401]).toContain(response.status());
  373 |   });
  374 | 
  375 |   test("reviews API responds", async ({ request }) => {
  376 |     const response = await request.get("/api/reviews");
  377 |     // Should return 200 (success) or 400 (validation error for missing productId)
  378 |     expect([200, 400]).toContain(response.status());
  379 |   });
  380 | 
  381 |   test("orders API responds", async ({ request }) => {
  382 |     const response = await request.get("/api/orders");
  383 |     // Various responses are acceptable - 200 (success), 400 (validation), 401 (auth), 404 (not found), 500 (server error)
  384 |     // Key is that it doesn't crash with "Something went wrong" page
  385 |     expect([200, 400, 401, 404, 500]).toContain(response.status());
  386 |   });
  387 | });
```