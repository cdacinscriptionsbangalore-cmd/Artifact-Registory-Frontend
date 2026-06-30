import { test, expect, Page } from "@playwright/test";

async function openDetailPage(page: Page) {
    await page.goto("/feed");

    await page.getByRole("link", {
        name: "View details",
    }).first().click();
}

test("detail page loads", async ({ page }) => {

    await openDetailPage(page);

    await expect(page).not.toHaveURL(/feed$/);

});

test("image carousel is visible", async ({ page }) => {

    await openDetailPage(page);

    await expect(
        page.getByRole("img").first()
    ).toBeVisible();

});

test("rating button is visible", async ({ page }) => {

    await openDetailPage(page);
    await expect(
        page.locator("#rate-post-btn")
    ).toBeVisible();

});

test("rating modal opens", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "#rate-post-btn"
    ).click();

    await expect(
        page.getByText(/Rate this inscription/i)
    ).toBeVisible();

});

test("rating modal closes", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "#rate-post-btn"
    ).click();

    await page.getByRole("button", {
        name: /cancel/i,
    }).click();

    await expect(
        page.getByText(/Rate this inscription/i)
    ).not.toBeVisible();

});

test("add transcription button is visible", async ({ page }) => {

    await openDetailPage(page);

    await expect(
        page.getByRole("button", {
            name: /add transcription/i,
        })
    ).toBeVisible();

});

test("transcription modal opens", async ({ page }) => {

    await openDetailPage(page);

    await page.getByRole("button", {
        name: /add transcription/i,
    }).click();

    await expect(
        page.getByRole("textbox")
    ).toBeVisible();

});

test("empty transcription cannot be submitted", async ({ page }) => {

    await openDetailPage(page);

    await page.getByRole("button", {
        name: /add transcription/i,
    }).click();

    await page.getByRole("button", {
        name: /post/i,
    }).click();

    await expect(
        page.getByText(
            "Description cannot be empty."
        )
    ).toBeVisible();

});

test("Transcription submits successfully", async ({ page }) => {

    await page.route(
        "**/post/addPoastDiscription",
        async route => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    data: {
                        ok: true,
                        message: "Comment posted successfully.",
                    },
                }),
            });
        }
    );

    await openDetailPage(page);

    await page
        .getByTestId("add-transcription-btn")
        .click();

    await page
        .getByTestId("add-transcription-text-input")
        .fill("This inscription belongs to the 12th century temple walls.");

    const responsePromise = page.waitForResponse(
        response =>
            response.url().includes("addPoastDiscription") &&
            response.request().method() === "POST"
    );

    await page
        .getByTestId("post-transcription-btn")
        .click();

    await responsePromise;

    await expect(
        page.getByText(
            /Comment posted successfully/i
        )
    ).toBeVisible();

});

test("transcription length validation works", async ({ page }) => {

    await openDetailPage(page);

    await page.getByRole("button", {
        name: /add transcription/i,
    }).click();

    await page.getByRole("textbox")
        .fill("a".repeat(201));

    await expect(
        page.getByText(
            "Maximum 200 characters allowed."
        )
    ).toBeVisible();

});


test("report modal opens", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    await expect(
        page.getByRole("dialog")
    ).toBeVisible();

});
test("report button disabled before reason selected", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    await expect(
        page.getByRole("button", {
            name: /^Report$/,
        })
    ).toBeDisabled();

});
test("selecting reason enables report button", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    await page.getByRole("radio")
        .first()
        .check();

    await expect(
        page.getByRole("button", {
            name: /^Report$/,
        })
    ).toBeEnabled();

});

test("cancel closes report modal", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    await page.locator(
        "#cancel-report-btn"
    ).click();

    const reportDialog = page
        .getByRole("dialog")
        .filter({
            has: page.getByText("Report Post"),
        });

    await expect(reportDialog).not.toBeVisible();
});
test("report details field accepts text", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    const details = page.getByRole("textbox", {
        name: /additional details/i,
    });

    await details.fill(
        "This post contains incorrect metadata."
    );

    await expect(details).toHaveValue(
        "This post contains incorrect metadata."
    );

});

test("report details counter updates", async ({ page }) => {

    await openDetailPage(page);

    await page.locator(
        "svg[data-testid='MoreVertIcon']"
    ).click();

    await page.locator(
        "#report-post-btn"
    ).click();

    await page.getByRole("textbox", {
        name: /additional details/i,
    }).fill("hello");

    await expect(
        page.getByText("5/500")
    ).toBeVisible();

});

test("report comment modal opens", async ({ page }) => {
    await openDetailPage(page);

    await page.locator('[data-testid^="comment-report-"]').first().click();
    await expect(
        page.getByText(/report comment/i)
    ).toBeVisible();
});

test("comment report disabled before reason selected", async ({ page }) => {
    await openDetailPage(page);

    await page.locator('[data-testid^="comment-report-"]').first().click();
    await expect(
        page.getByRole("button", {
            name: /^report$/i,
        })
    ).toBeDisabled();
});
test("selecting comment report reason enables report button", async ({ page }) => {
    await openDetailPage(page);

    await page.locator('[data-testid^="comment-report-"]').first().click();
    await page.getByRole("radio").first().click();

    await expect(
        page.getByRole("button", {
            name: /^report$/i,
        })
    ).toBeEnabled();
});

test("comment can be liked", async ({ page }) => {

    await openDetailPage(page);

    const likeButton =
        page.getByLabel("Like comment").first();

    const countBefore = parseInt(
        (await likeButton.locator("span").textContent()) ?? "0"
    );

    await page.route(
        "**/post/addVote",
        async route => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    data: {
                        upvote: countBefore + 1,
                        userVote: ["mock-user-id"],
                    },
                }),
            });
        }
    );

    await likeButton.click();

    await expect(
        likeButton.locator("span")
    ).toHaveText(
        String(countBefore + 1)
    );

});

test("liked comment can be unliked", async ({ page }) => {

    await openDetailPage(page);

    const likeButton =
        page.getByLabel("Like comment").first();

    const countBefore = parseInt(
        (await likeButton.locator("span").textContent()) ?? "0"
    );

    let firstRequest = true;
    // console.log(
    //     await page.getByLabel("Like comment")
    //         .allTextContents()
    // );
    await page.route(
        "**/post/addVote",
        async route => {

            const upvote = firstRequest
                ? countBefore + 1
                : countBefore;

            firstRequest = false;

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    data: {
                        upvote,
                        userVote:
                            upvote > countBefore
                                ? ["mock-user-id"]
                                : [],
                    },
                }),
            });
        }
    );

    await likeButton.click();

    await expect(
        likeButton.locator("span")
    ).toHaveText(
        String(countBefore + 1)
    );

    await likeButton.click();

    await expect(
        likeButton.locator("span")
    ).toHaveText(
        String(countBefore)
    );

});


test("like request failure restores previous state", async ({ page }) => {

    await page.route(
        "**/post/addVote",
        async route => {
            await route.fulfill({
                status: 500,
                body: "error",
            });
        }
    );

    await openDetailPage(page);

    const likeButton =
        page.getByLabel("Like comment").first();

    const countBefore = parseInt(
        (await likeButton.locator("span").textContent()) ?? "0"
    );

    await likeButton.click();

    await expect(
        likeButton.locator("span")
    ).toHaveText(
        String(countBefore)
    );

});



test("rating submits successfully", async ({ page }) => {

    await page.route(
        "**/post/addRating",
        async route => {

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    data: {
                        ok: true,
                        message: "Rating submitted successfully!",
                        rating: 5,
                    },
                }),
            });

        }
    );

    await openDetailPage(page);
    // await page.pause()

    await page.getByRole('button', { name: 'Rate', exact: true }).click();

    await page
        .getByTestId("rating-star-5")
        .click();

    const responsePromise = page.waitForResponse(
        response =>
            response.url().includes("addRating") &&
            response.request().method() === "POST"
    );

    await page.getByTestId("submit-rating-btn").click();

    await responsePromise;

    await expect(
        page.getByText(
            /Rating submitted successfully!/i
        )
    ).toBeVisible();

});

test("rating api failure shows error", async ({ page }) => {

    await page.route(
        "**/post/addRating",
        async route => {

            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({
                    success: false,
                    message: "Failed to submit rating.",
                }),
            });


        }
    );
    page.on("request", request => {
        console.log(request.method(), request.url());
    });

    page.on("response", response => {
        console.log(response.status(), response.url());
    });
    await openDetailPage(page);

    await page.getByRole('button', { name: 'Rate', exact: true }).click();

    await page
        .getByTestId("rating-star-4")
        .click();

    await page.getByTestId("submit-rating-btn").click();

    await expect(
        page.getByText(
            /Failed to submit rating./i
        )
    ).toBeVisible();

    await expect(
        page.getByTestId("submit-rating-btn")
    ).toBeVisible();

});

test("post report submits successfully", async ({ page }) => {

    await page.route(
        "**/report",
        async route => {

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    message: "Report submitted for AI moderation.",
                }),
            });

        }
    );

    await openDetailPage(page);

    await page
        .locator("svg[data-testid='MoreVertIcon']")
        .click();

    await page
        .locator("#report-post-btn")
        .click();

    await page
        .getByRole("radio")
        .first()
        .check();

    const responsePromise = page.waitForResponse(
        response =>
            response.url().includes("/report") &&
            response.request().method() === "POST"
    );

    await page.getByRole("button", {
        name: /^report$/i,
    }).click();

    await responsePromise;

    await expect(
        page.getByText(
            /Report submitted for AI moderation/i
        )
    ).toBeVisible();

    await expect(
        page.getByTestId("report-post-dialog")
    ).not.toBeVisible();
});

test("transcription report failure shows error", async ({ page }) => {

    await page.route(
        "**/report",
        async route => {

            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({
                    success: false,
                    message: "Failed to submit report.",
                }),
            });

        }
    );

    await openDetailPage(page);
    await page
        .locator("[id^='comment-report-']")
        .first()
        .click();

    await page
        .getByRole("radio")
        .first()
        .check();

    await page.getByRole("button", {
        name: /^report$/i,
    }).click();

    await expect(
        page.getByText(
            /Failed to submit report/i
        )
    ).toBeVisible();

    await expect(
        page.getByTestId("report-post-dialog")
    ).not.toBeVisible();

});

test("transcription failure keeps modal open", async ({ page }) => {

    await page.route(
        "**/post/addPoastDiscription",
        async route => {

            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({
                    success: false,
                    message: "Failed to post description.",
                }),
            });

        }
    );

    await openDetailPage(page);

    await page.getByTestId("add-transcription-btn").click();

    await page
        .getByTestId("add-transcription-text-input")
        .fill("Example transcription.");

    await page
        .getByTestId("post-transcription-btn")
        .click();

    await expect(
        page.getByText(
            /Failed to post description/i
        )
    ).toBeVisible();

    await expect(
        page.getByRole("dialog")
    ).toBeVisible();

});