import { test, expect, Page } from "@playwright/test";
import path from 'path';

const imagePath = path.join(
    process.cwd(),
    "tests",
    "assets",
    "test-image.jpeg"
);

async function openGroupForm(page: Page) {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );

    // await page.pause();

    await expect(
        page.getByRole("button", {
            name: "Proceed",
        })
    ).toBeEnabled({
        timeout: 60000,
    });

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    await page.locator('[id^="Ungrouped"]').first().click();

    await page.getByRole("button", {
        name: "Create Group From Selected",
    }).click();

    await expect(
        page.getByRole("textbox", {
            name: "Title",
        })
    ).toBeVisible({
        timeout: 60000,
    });

}
async function fillValidGroup(page: Page) {

    await page.getByRole("textbox", {
        name: "Title",
    }).fill("Palm Leaf Manuscripts");

    await page.getByRole("textbox", {
        name: "Topic",
    }).fill("Literature");

    await page.getByRole("textbox", {
        name: "Language (comma separated)",
    }).fill("Sanskrit");

    await page.getByRole("textbox", {
        name: "Script (comma separated)",
    }).fill("Grantha");

}

test.setTimeout(120000);


test("successful group submission redirects to feed", async ({ page }) => {
    await page.route(
        "**/post/addPostWithFile",
        async route => {

            // console.log("Mocked upload request");

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                    data: {},
                }),
            });

        }
    );

    await openGroupForm(page);

    await fillValidGroup(page);

    await page.getByRole("textbox", {
        name: "Description",
    }).fill("Test description");

    // page.on("response", async (response) => {

    //     if (
    //         response.url().includes(
    //             "addPostWithFile"
    //         )
    //     ) {

    //         console.log(
    //             "STATUS:",
    //             response.status()
    //         );

    //         console.log(
    //             "URL:",
    //             response.url()
    //         );

    //         console.log(
    //             await response.text()
    //         );
    //     }

    // });

    await page.getByRole("button", {
        name: "Submit Group",
    }).click();
    await expect(page).toHaveURL(
        /feed/,
        {
            timeout: 60000,
        }
    );
    // await page.pause();

});


test("proceed button becomes enabled after upload", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );
    await expect(
        page.getByRole("button", {
            name: "Proceed",
        })
    ).toBeEnabled({
        timeout: 60000,
    });
    await expect(
        page.getByRole("button", {
            name: "Proceed",
        })
    ).toBeEnabled();

});

test("group creation modal opens", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    await page.locator('[id^="Ungrouped"]').first().click();

    await page.getByRole("button", {
        name: "Create Group From Selected",
    }).click();

    await expect(
        page.getByRole("textbox", {
            name: "Title",
        })
    ).toBeVisible();

});


test("Successful Group Submission", async ({ page }) => {

    await openGroupForm(page);

    await page.getByRole("textbox", {
        name: "Title",
    }).fill("Palm Leaf Manuscripts");

    await page.getByRole("textbox", {
        name: "Topic",
    }).fill("Literature");

    await page.getByRole("textbox", {
        name: "Language (comma separated)",
    }).fill("Sanskrit");

    await page.getByRole("textbox", {
        name: "Script (comma separated)",
    }).fill("Grantha");

    await page.getByRole("textbox", {
        name: "Description",
    }).fill("Test description");

});

test("multiple images can be uploaded", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        [
            imagePath,
            imagePath,
            imagePath,
        ]
    );

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    await expect(
        page.getByText("Total Images: 3 / 20")
    ).toBeVisible({
        timeout: 60000,
    });



});



test.describe("group form tests", () => {

    test("title is required", async ({ page }) => {

        await openGroupForm(page);
        await expect(
            page.getByRole("textbox", {
                name: "Title",
            })
        ).toBeVisible();
        await page.getByRole("button", {
            name: "Submit Group",
        }).click();

        await expect(
            page.getByText("Title is required.")
        ).toBeVisible();

    });


    test("title field is visible in group form", async ({ page }) => {

        await openGroupForm(page);

        await expect(
            page.getByRole("textbox", {
                name: "Title",
            })
        ).toBeVisible();

    });

    test("anonymous toggle can be changed", async ({ page }) => {

        await openGroupForm(page);

        const dropdown = page.getByRole("combobox", {
            name: /post anonymously/i,
        });

        await dropdown.click();

        await page.getByRole("option", {
            name: "Yes",
        }).click();

        await expect(dropdown).toContainText("Yes");

    });

    test("all required fields can be filled", async ({ page }) => {

        await openGroupForm(page);

        await fillValidGroup(page);

        await expect(
            page.getByRole("textbox", {
                name: "Title",
            })
        ).toHaveValue("Palm Leaf Manuscripts");

    });

    test("material can be changed", async ({ page }) => {

        await openGroupForm(page);

        const material = page.getByRole("combobox", {
            name: /type/i,
        });

        await material.click();

        await page.getByRole("option", {
            name: "Clay",
        }).click();

        await expect(material).toContainText("Clay");

    });

})

test("proceed button is not available before upload", async ({ page }) => {

    await page.goto("/upload");

    await expect(
        page.getByRole("button", {
            name: "Proceed",
        })
    ).toHaveCount(0);

});
test("create group button disabled when no image selected", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        [imagePath, imagePath]
    );

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    const createGroupButton =
        page.getByRole("button", {
            name: "Create Group From Selected",
        });

    await expect(
        createGroupButton
    ).toBeDisabled();

});

test("selected image can be deselected", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    const image =
        page.locator('[id^="Ungrouped"]').first();

    await image.click();

    await expect(
        page.getByRole("button", {
            name: "Create Group From Selected",
        })
    ).toBeEnabled();

    await image.click();

    await expect(
        page.getByRole("button", {
            name: "Create Group From Selected",
        })
    ).toBeDisabled();

});

test("group can be created from multiple images", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        [
            imagePath,
            imagePath,
            imagePath,
        ]
    );

    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    const images =
        page.locator('[id^="Ungrouped"]');

    await images.nth(0).click();
    await images.nth(1).click();

    await page.getByRole("button", {
        name: "Create Group From Selected",
    }).click();

    await expect(
        page.getByRole("textbox", {
            name: "Title",
        })
    ).toBeVisible();

});

test("upload error is shown when API returns 500", async ({ page }) => {

    await page.route(
        "**/post/addPostWithFile",
        async route => {

            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({
                    success: false,
                    message: "Internal Server Error",
                }),
            });

        }
    );

    await openGroupForm(page);

    await fillValidGroup(page);

    await page.getByRole("button", {
        name: "Submit Group",
    }).click();

    await expect(page).not.toHaveURL(/feed/);

    await expect(
        page.getByText(
            /error|failed|internal server error/i
        )
    ).toBeVisible();

});

test("upload handles network timeout", async ({ page }) => {

    await page.route(
        "**/post/addPostWithFile",
        async route => {
            await route.abort();
        }
    );

    await openGroupForm(page);

    await fillValidGroup(page);

    await page.getByRole("button", {
        name: "Submit Group",
    }).click();

    await expect(page).not.toHaveURL(/feed/);

    await expect(
        page.getByText(
            /network|failed|error/i
        )
    ).toBeVisible();

});

test("group submission failure does not redirect", async ({ page }) => {

    await page.route(
        "**/post/addPostWithFile",
        async route => {

            await page.route(
                "**/post/addPostWithFile",
                async route => {
                    await route.fulfill({
                        status: 500,
                        contentType: "application/json",
                        body: JSON.stringify({
                            success: false,
                            message: "Upload failed",
                        }),
                    });
                }
            );
        }

    );

    await openGroupForm(page);

    await fillValidGroup(page);

    await page.getByRole("button", {
        name: "Submit Group",
    }).click();

    await expect(
        page
    ).not.toHaveURL(/feed/);

});

test("cannot upload more than 20 images", async ({ page }) => {

    const files = Array(21).fill(imagePath);

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        files
    );

    await expect(
        page.getByText(
            /20|maximum|limit/i
        )
    ).toBeVisible();

});

test("group modal can be closed without losing upload", async ({ page }) => {

    await openGroupForm(page);

    await page.getByRole("button", {
        name: "Close",
        exact: true,
    }).click();

    await expect(
        page.getByText("Total Images: 1 / 20")
    ).toBeVisible();

});


test("authenticated user can access upload", async ({ page }) => {

    await page.goto("/upload");

    await expect(
        page.getByText("Add Inscription")
    ).toBeVisible();

});

test("image without GPS metadata shows warning", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        'tests/assets/no-gps-image.jpg'
    );

    await expect(
        page.getByText(/no GPS data found/i)
    ).toBeVisible({
        timeout: 60000,
    });

});

test("image with GPS metadata uploads successfully", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );
    await page.getByRole("button", {
        name: "Proceed",
    }).click();

    await expect(
        page.getByText("Total Images: 1 / 20")
    ).toBeVisible({
        timeout: 60000,
    });

});

test("suggest description button is visible", async ({ page }) => {

    await openGroupForm(page);

    await expect(
        page.getByRole("button", {
            name: "Suggest Description",
        })
    ).toBeVisible();

});

test("use suggestion populates description field", async ({ page }) => {

    const suggestion =
        "Ancient Sanskrit inscription discovered near Madurai";

    await page.route(
        "**/n8n/webhook-test/**",
        async route => {

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    suggestion,
                }),
            });

        }
    );

    await openGroupForm(page);

    await page.getByRole("button", {
        name: "Suggest Description",
    }).click();

    await page.getByRole("button", {
        name: "Use suggestion",
    }).click();

    await expect(
        page.getByRole("textbox", {
            name: "Description",
        })
    ).toHaveValue(suggestion);

});
test("suggest description failure is shown", async ({ page }) => {

    await page.route(
        "**/n8n/webhook-test/**",
        async route => {

            await route.abort();

        }
    );

    await openGroupForm(page);

    await page.getByRole("button", {
        name: "Suggest Description",
    }).click();

    await expect(
        page.getByText(
            "Failed to get suggestion."
        )
    ).toBeVisible();

});
test("use suggestion button appears", async ({ page }) => {

    await page.route(
        "**/n8n/webhook-test/**",
        async route => {

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    suggestion:
                        "Ancient Sanskrit inscription",
                }),
            });

        }
    );

    await openGroupForm(page);

    await page.getByRole("button", {
        name: "Suggest Description",
    }).click();

    await expect(
        page.getByTestId(
            "use-suggestion-button",
        )
    ).toBeVisible({ timeout: 60000 });
});

test("OCR extraction failure shows GPS warning", async ({ page }) => {

    await page.route(
        "**/extractCoordinates**",
        async route => {

            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: false,
                }),
            });

        }
    );

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        'tests/assets/no-gps-image.jpg'
    );

    await expect(
        page.getByText(
            /no GPS data found/i
        )
    ).toBeVisible({
        timeout: 60000,
    });

});

test("image with EXIF GPS skips OCR fallback", async ({ page }) => {

    await page.goto("/upload");

    await page.setInputFiles(
        'input[type="file"]',
        imagePath
    );
    await page.getByRole("button", {
        name: "Proceed",
    }).click();


    await expect(
        page.getByText(
            "Total Images: 1 / 20"
        )
    ).toBeVisible({
        timeout: 60000,
    });

    await expect(
        page.getByText(
            /no GPS data found/i
        )
    ).toHaveCount(0);

});