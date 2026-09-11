import { expect, test } from "@playwright/test";

test("serves HTML and generated images with security headers", async ({
  request,
}) => {
  for (const path of ["/", "/image?f=svg"]) {
    const response = await request.get(path);

    expect(response.ok()).toBe(true);
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers()["permissions-policy"]).toBe("camera=(self)");
    expect(response.headers()["content-security-policy"]).toContain(
      "default-src 'self'",
    );
  }
});

test("renders the editor and switches settings tabs", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("eyemono.moe icon maker");
  await expect(
    page.getByRole("heading", { name: "eyemono.svg" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "hair" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.getByRole("tab", { name: "eye" }).click();

  await expect(
    page.getByRole("radiogroup", { name: "eyebrow type" }),
  ).toBeVisible();
});

test("supports keyboard navigation for settings tabs", async ({ page }) => {
  await page.goto("/");
  const hairTab = page.getByRole("tab", { name: "hair" });
  const skinTab = page.getByRole("tab", { name: "skin" });

  await hairTab.focus();
  await page.keyboard.press("ArrowRight");

  await expect(skinTab).toBeFocused();
  await expect(skinTab).toHaveAttribute("aria-selected", "true");
});

test("opens and closes the file menu with the keyboard", async ({ page }) => {
  await page.goto("/");
  const fileMenu = page.getByRole("menuitem", { name: "File", exact: true });

  await fileMenu.focus();
  await page.keyboard.press("Enter");
  const firstItem = page.getByRole("menuitem", { name: /Copy as SVG/ });
  const menu = page.getByRole("menu");
  await expect(firstItem).toBeVisible();
  await expect(menu).toBeFocused();
  await expect(firstItem).toHaveAttribute("data-highlighted", "");

  await page.keyboard.press("Escape");
  await expect(firstItem).toBeHidden();
  await expect(fileMenu).toBeFocused();
});

test("moves between top-level menus with arrow keys", async ({ page }) => {
  await page.goto("/");
  const fileMenu = page.getByRole("menuitem", { name: "File", exact: true });
  const editMenu = page.getByRole("menuitem", { name: "Edit", exact: true });

  await expect(page.getByRole("menubar")).toBeVisible();
  await fileMenu.focus();
  await page.keyboard.press("ArrowRight");
  await expect(editMenu).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(fileMenu).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menuitem", { name: /Copy as SVG/ }),
  ).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: /Undo/ })).toBeVisible();
  await expect(page.getByRole("menu", { name: "Edit" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("menuitem", { name: /Copy as SVG/ }),
  ).toBeVisible();
  await expect(page.getByRole("menu", { name: "File" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
    "data-highlighted",
    "",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: /Undo/ })).toBeVisible();
  await expect(page.getByRole("menu", { name: "Edit" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(editMenu).toBeFocused();
});

test("shows a success toast after copying SVG", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: /Copy as SVG/ }).click();

  await expect(page.getByText("copied as SVG!", { exact: true })).toBeVisible();
});

test("runs an action selected from a nested file menu", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Share" }).hover();
  await page.getByRole("menuitem", { name: /Copy SVG url/ }).click();

  await expect(
    page.getByText("copied SVG url!", { exact: true }),
  ).toBeVisible();
});

test("selects an icon part and records the state in the URL", async ({
  page,
}) => {
  await page.goto("/");
  const defaultHair = page.getByRole("radio", { name: "Default" }).first();
  const ponytail = page.getByRole("radio", {
    name: "Ponytail",
    exact: true,
  });
  await expect(defaultHair).toBeChecked();
  const initialUrl = page.url();

  await ponytail.check({ force: true });

  await expect(ponytail).toBeChecked();
  await expect.poll(() => page.url()).not.toBe(initialUrl);
  expect(new URL(page.url()).searchParams.get("p")).not.toBeNull();

  await page.reload();

  await expect(ponytail).toBeChecked();
});

test("enables a derived color field when automatic color is disabled", async ({
  page,
}) => {
  await page.goto("/");
  const automaticColor = page
    .getByRole("checkbox", {
      name: "Set automatically",
    })
    .first();
  const colorInput = page.locator('input[type="color"]').nth(1);

  await expect(automaticColor).toBeEnabled();
  await expect(automaticColor).toBeChecked();
  await expect(colorInput).toBeDisabled();

  await automaticColor.focus();
  await page.keyboard.press("Space");

  await expect(automaticColor).not.toBeChecked();
  await expect(colorInput).toBeEnabled();
});

test("operates camera controls with the keyboard", async ({ page }) => {
  await page.addInitScript(() => {
    let notifyDeviceChange: EventListener | undefined;
    const createCamera = () =>
      ({
        deviceId: "test-camera",
        groupId: "test-group",
        kind: "videoinput",
        label: "Test Camera",
        toJSON: () => ({}),
      }) satisfies MediaDeviceInfo;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        addEventListener: (type: string, listener: EventListener) => {
          if (type === "devicechange") notifyDeviceChange = listener;
        },
        enumerateDevices: async () => [createCamera()],
        getUserMedia: async () => {
          throw new DOMException("Camera stream is mocked in this test");
        },
        removeEventListener: () => {},
      },
    });
    Object.assign(window, {
      triggerDeviceChange: () =>
        notifyDeviceChange?.(new Event("devicechange")),
    });
  });
  await page.goto("/");
  await page.getByRole("tab", { name: "camera" }).click();

  const cameraSelect = page.getByRole("combobox", { name: "camera input" });
  await expect(cameraSelect).toBeEnabled();
  await cameraSelect.click();
  await page.getByRole("option", { name: "Test Camera" }).click();
  await expect(cameraSelect).toContainText("Test Camera");
  await page.evaluate(() =>
    (
      window as typeof window & { triggerDeviceChange: () => void }
    ).triggerDeviceChange(),
  );
  await expect(cameraSelect).toContainText("Test Camera");

  const mirrorSwitch = page.getByRole("checkbox", { name: "mirror video" });
  const wasMirrored = await mirrorSwitch.isChecked();
  await mirrorSwitch.focus();
  await page.keyboard.press("Space");
  await expect(mirrorSwitch).toBeChecked({ checked: !wasMirrored });

  const slider = page.getByRole("slider").first();
  const initialValue = await slider.getAttribute("aria-valuenow");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).not.toHaveAttribute("aria-valuenow", initialValue ?? "");
});

test("undoes and redoes a color change", async ({ page }) => {
  await page.goto("/");
  const color = page.locator('input[type="color"]').first();
  const initialColor = await color.inputValue();

  await color.fill("#123456");
  await expect(color).toHaveValue("#123456");

  await page.keyboard.press("Control+z");
  await expect(color).toHaveValue(initialColor);

  await page.keyboard.press("Control+Shift+Z");
  await expect(color).toHaveValue("#123456");
});
