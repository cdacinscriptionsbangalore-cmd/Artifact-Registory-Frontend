import { test } from "@playwright/test";

test("authenticate", async ({ page }) => {

  await page.goto("http://localhost:3000/login");

  await page.click("text=Login with Google");

  // manually complete Google login

  await page.pause();

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });

});