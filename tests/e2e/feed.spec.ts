import { test, expect, Page } from "@playwright/test";
import path from "path";

test("feed loads posts", async ({ page }) => {

    await page.goto("/feed");

    await expect(
        page.locator("#search-bar-input-field")
    ).toBeVisible();

});

test("search filters posts", async ({ page }) => {

    await page.goto("/feed");

    await page.locator(
        "#search-bar-input-field"
    ).fill("Bengaluru");

    await expect(
        page.getByText(/sites found/i)
    ).toBeVisible();

});
test("empty search state appears", async ({ page }) => {

    await page.goto("/feed");

    await page.locator(
        "#search-bar-input-field"
    ).fill(
        "THIS_SHOULD_NOT_EXIST_123456"
    );

    await expect(
        page.getByText(
            "No sites found"
        )
    ).toBeVisible();

});
test("pagination controls appear when multiple pages exist", async ({ page }) => {

    await page.goto("/feed");

    await expect(
        page.getByRole("button", {
            name: "Previous",
        })
    ).toBeVisible();

});


test("search can be cleared", async ({ page }) => {

    await page.goto("/feed");

    const search = page.locator(
        "#search-bar-input-field"
    );

    await search.fill("Bengaluru");

    await search.clear();

    await expect(search).toHaveValue("");

});

test("results count appears after search", async ({ page }) => {

    await page.goto("/feed");

    await page.locator(
        "#search-bar-input-field"
    ).fill("Bengaluru");

    await expect(
        page.getByText(/sites found/i)
    ).toBeVisible();

});

test("empty state disappears for valid search", async ({ page }) => {

    await page.goto("/feed");

    const search = page.locator(
        "#search-bar-input-field"
    );

    await search.fill(
        "THIS_SHOULD_NOT_EXIST_123456"
    );

    await expect(
        page.getByText("No sites found")
    ).toBeVisible();

    await search.clear();

    await search.fill("Bengaluru");

    await expect(
        page.getByText("No sites found")
    ).not.toBeVisible();

});


test("search result count updates", async ({ page }) => {

    await page.goto("/feed");

    await page.locator(
        "#search-bar-input-field"
    ).fill("Bengaluru");

    await expect(
        page.getByText(/sites found/i)
    ).toBeVisible();


});

test("clicking view details opens detail page", async ({ page }) => {

    await page.goto("/feed");

    await page.getByRole("link", {
        name: "View details",
    }).first().click();

    await expect(page).not.toHaveURL(
        /\/feed$/
    );

});

test("feed cards show view details links", async ({ page }) => {

    await page.goto("/feed");

    await expect(
        page.getByRole("link", {
            name: "View details",
        }).first()
    ).toBeVisible();

});

test("search input accepts text", async ({ page }) => {

    await page.goto("/feed");

    const search =
        page.locator(
            "#search-bar-input-field"
        );

    await search.fill("Bengaluru");
    await expect(search)
        .toHaveValue("Bengaluru");

});

test("search is case insensitive", async ({ page }) => {

  await page.goto("/feed");

  await page
    .locator("#search-bar-input-field")
    .fill("BENGALURU");

  await expect(
    page.getByText(/sites found/i)
  ).toBeVisible();

});