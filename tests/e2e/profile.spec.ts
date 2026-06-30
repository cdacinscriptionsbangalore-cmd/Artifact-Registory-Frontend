import { test, expect, Page } from "@playwright/test";


test("profile page loads", async ({ page }) => {
    await page.goto("/profile");

    await expect(
        page.getByRole("button", {
            name: /edit profile/i,
        })
    ).toBeVisible();
});

test("user name is visible", async ({ page }) => {
    await page.goto("/profile");

    await expect(
        page.getByText("Ambika Choudhary")
    ).toBeVisible();
});

test("profile avatar is visible", async ({ page }) => {
    await page.goto("/profile");

    await expect(
        page.getByTestId("profile-avatar")
    ).toBeVisible();
})

// Stats section
test("images uploaded stat is visible", async ({ page }) => {
    await page.goto("/profile");

})
test("upvotes received stat is visible", async ({ page }) => {
    await page.goto("/profile");

})

// Contribution tabs

test("my posts tab visible", async ({ page }) => {
    await page.goto("/profile");
    const postsTab = page.getByRole("tab", {
        name: /my posts/i,
    });
    await expect(
        postsTab
    ).toBeVisible();
})

test("my comments tab visible", async ({ page }) => {
    await page.goto("/profile");
    const commentsTab = page.getByRole("tab", {
        name: /my comments/i,
    });
    await expect(
        commentsTab
    ).toBeVisible();
})
test("under review tab visible", async ({ page }) => {
    await page.goto("/profile");
    const underReviewPostsTab = page.getByRole("tab", {
        name: /under review posts/i,
    });
    await expect(
        underReviewPostsTab
    ).toBeVisible();

})



test("can switch to comments tab", async ({ page }) => {
    await page.goto("/profile");

    const commentsTab = page.getByRole("tab", {
        name: /my comments/i,
    });

    await commentsTab.click();

    await expect(commentsTab)
        .toHaveAttribute(
            "aria-selected",
            "true",
            { timeout: 10000 }
        );
})

test("can switch to under review tab", async ({ page }) => {
    await page.goto("/profile");

    const underReviewPostsTab = page.getByRole("tab", {
        name: /under review posts/i,
    });

    await underReviewPostsTab.click();
    // await page.pause();
    await expect(underReviewPostsTab)
        .toHaveAttribute(
            "aria-selected",
            "true",
            { timeout: 10000 }
        );
}) 

// Share Profile Modal section

test("share modal opens", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /share/i,
    }).click();

    await expect(
        page.getByText(/Share this profile/i)
    ).toBeVisible();
})

test("share modal closes", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /share/i,
    }).click();

    await page.keyboard.press("Escape");
})


test("copy link button exists", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /share/i,
    }).click();
})

//Edit Profile Modal section

test("edit profile modal opens", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();
    // await page.pause()
})

test("edit profile modal closes when cancel button in modal is clicked", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    await page.getByRole("button", {
        name: /Cancel/i,
    }).click();

    // await page.pause()
})

test("edit profile modal closes when backdrop is clicked", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    // await page.pause()
    await page.getByTestId(
        "edit-profile-modal-backdrop"
    ).click({
        position: { x: 50, y: 50 }
    });
    // await page.pause()
    await expect(
        page.getByText(
            /Profile Picture/i,
        )
    ).toBeHidden();
    // await page.pause()
})

test("username field accepts input", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    const nameInput = page.getByRole("textbox", {
        name: "Name",
    });

    await nameInput.fill("Monty Python");

    await expect(nameInput).toHaveValue("Monty Python");
    // await page.pause()
});


test("bio field accepts input", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    const bioInput = page.getByRole("textbox", {
        name: "Bio",
    });

    await bioInput.fill("Comedy troup");

    await expect(bioInput).toHaveValue("Comedy troup");
    // await page.pause()
})

test("profile picture can be selected", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    const fileInput = page.locator(
        'input[type="file"]'
    ).first();

    await fileInput.setInputFiles(
        "tests/assets/test-profile-pic.jpg"
    );

    await expect(
        page.getByText("test-profile-pic.jpg")
    ).toBeVisible();

    // await page.pause()
});

test("cover picture can be selected", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    const fileInput = page.locator(
        'input[type="file"]'
    ).nth(1);

    await fileInput.setInputFiles(
        "tests/assets/test-cover-pic.avif"
    );

    await expect(
        page.getByText("test-cover-pic.avif")
    ).toBeVisible();

    // await page.pause()
});

test("profile changes can be saved", async ({ page }) => {
    await page.route(
        "**/user/updateProfile**",
        route =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    success: true,
                }),
            })
    );

    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    await page.getByLabel(/name/i)
        .fill("Updated User");

    await page.getByRole("button", {
        name: /^save$/i,
    }).click();

    await expect(
        page.getByText(/success/i)
    ).toBeVisible();
});

test("profile picture can be updated", async ({ page }) => {

    await page.route("**/user/uploadProfileImage", async route => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                data: {
                    imageUrl: "https://example.com/profile.jpg"
                }
            })
        });
    });

    await page.goto("/profile");

    await page.getByRole("button", {
        name: /edit profile/i,
    }).click();

    await page.locator(
        'input[type="file"]'
    ).first().setInputFiles(
        "tests/assets/test-profile-pic.jpg"
    );

    await page.getByRole("button", {
        name: /^save$/i,
    }).click();

    await expect(
        page.getByText(
            /profile updated successfully/i
        )
    ).toBeVisible();

    // await page.pause()

});

test("clicking a post from My Posts tab opens detail page of the post clicked", async ({ page }) => {

    await page.goto("/profile");

    const currentUrl = page.url();

    await page.locator(
        '[data-testid="profile-post-card"]'
    ).first().click();

    await expect(page)
        .toHaveURL(/\/feed\/.+/);
});

test("clicking a comment from My comments tab opens associated post", async ({ page }) => {

    await page.goto("/profile");

    await page.getByRole("tab", {
        name: /my comments/i,
    }).click();

    await page.locator(
        '[data-testid="profile-comment-card"]'
    ).first().click();

    await expect(page)
        .toHaveURL(/\/feed\/.+/);

});