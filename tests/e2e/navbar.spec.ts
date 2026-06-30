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

test("desktop authenticated navbar shows protected links", async ({ page }) => {

    await loginAsMockUser(page);
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    await page.goto("/home");

    await expect(page.getByRole('link', { name: 'Feed' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Upload', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
});

test("desktop logged out navbar shows public links", async ({ page }) => {

    await logoutMockUser(page);

    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    await page.goto("/home");

    await expect(
        page.getByRole("link", {
            name: "Featured Discoveries",
        })
    ).toBeVisible();

    await expect(
        page.getByRole("link", {
            name: "How it works",
        })
    ).toBeVisible();

    await expect(
        page.getByRole("link", {
            name: "Community",
        })
    ).toBeVisible();

    await expect(
        page.getByRole("link", {
            name: "Get Started",
        })
    ).toBeVisible();
});

test("mobile menu opens", async ({ page }) => {

    await loginAsMockUser(page);

    await page.setViewportSize({
        width: 375,
        height: 812,
    });

    await page.goto("/home");

    await page.getByTestId("mobile-menu-btn").click();

    await expect(
        page.getByRole("link", {
            name: "Feed",
        })
    ).toBeVisible();
});

test("mobile profile navigation works", async ({ page }) => {

    await loginAsMockUser(page);

    await page.setViewportSize({
        width: 375,
        height: 812,
    });

    await page.goto("/home");

    await page.getByTestId("mobile-menu-btn").click();

    await page.getByRole("link", {
        name: "Profile",
    }).click();

    await expect(page).toHaveURL(/profile/);
});

test("mobile logged out upload redirects to login", async ({ page }) => {

    await logoutMockUser(page);

    await page.setViewportSize({
        width: 375,
        height: 812,
    });

    await page.goto("/home");

    await page.getByTestId("mobile-menu-btn").click();

    await page.getByRole("button", {
        name: /login/i,
    }).click();

    await expect(page).toHaveURL(/login/);
});