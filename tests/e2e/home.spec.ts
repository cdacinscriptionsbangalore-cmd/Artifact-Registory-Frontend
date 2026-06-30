import { test, expect, Page } from "@playwright/test";

export async function loginAsMockUser(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem("accessToken", "mock-playwright-token");

        localStorage.setItem(
            "user",
            JSON.stringify({
                _id: "mock-user-id",
                username: "Playwright User",
                email: "playwright@example.com",
            })
        );
    });
}

export async function logoutMockUser(page: Page) {
    await page.addInitScript(() => {
        localStorage.setItem(
            "PLAYWRIGHT_DISABLE_MOCK_AUTH",
            "true"
        );
    });
}

test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(
        page.getByRole('heading', { name: 'Let Us Decode Ancient Wisdom' })
    ).toBeVisible();
});

test("Upload Inscription redirects to login when logged out", async ({ page }) => {
    await logoutMockUser(page)  
    await page.goto("/");
    const value = await page.evaluate(() =>
        localStorage.getItem("PLAYWRIGHT_DISABLE_MOCK_AUTH")
    );
    console.log("VALUE OF PLAYWRIGHT_DISABLE_MOCK_AUTH",value)
    // await page.pause()
    await page.getByRole('link', { name: 'Upload Inscription' }).click();

    await expect(page).toHaveURL(/login/);
});

test("Upload Inscription redirects to upload when logged in", async ({ page }) => {

    await loginAsMockUser(page);

    await page.goto("/");

    await page.getByRole('link', { name: 'Upload Inscription' }).click();

    await expect(page).toHaveURL(/upload/);
});

test("Explore Collection redirects to login when logged out", async ({ page }) => {
    await logoutMockUser(page)  

    await page.goto("/");

    await page.getByTestId("hero-explore-btn").click();

    await expect(page).toHaveURL(/login/);
});

test("Explore Collection redirects to feed when logged in", async ({ page }) => {

    await loginAsMockUser(page);

    await page.goto("/");

    await page.getByTestId("hero-explore-btn").click();

    await expect(page).toHaveURL(/feed/);
});

test("Total Posts card redirects to feed", async ({ page }) => {

    await loginAsMockUser(page);

    await page.goto("/");
    // await page.pause()
    await page.getByTestId('stats-total-posts-link').click();

    await expect(page).toHaveURL(/feed/);
});

test("Total Posts card redirects to login when logged out", async ({ page }) => {

    await logoutMockUser(page);

    await page.goto("/");
    // await page.pause()
    await page.getByTestId('stats-total-posts-link').click();

    await expect(page).toHaveURL(/login/);
});

test("Start Contributing redirects to upload when logged in", async ({ page }) => {

    await loginAsMockUser(page);

    await page.goto("/");

    await page.getByTestId("cta-contribute-btn").click();

    await expect(page).toHaveURL(/upload/);
});

test("Start Contributing redirects to login when logged out", async ({ page }) => {

    await logoutMockUser(page);

    await page.goto("/");

    await page.getByTestId("cta-contribute-btn").click();

    await expect(page).toHaveURL(/login/);
});

