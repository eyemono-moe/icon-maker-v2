import { expect, test } from "@playwright/test";

test("server renders and hydrates without hydration mismatch", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("eyemono.svg");

  await page.addInitScript(() => {
    const capture = () => {
      const heading = document.querySelector("h1");
      const state = window as typeof window & { __ssrHeading?: Element };
      if (heading && !state.__ssrHeading) state.__ssrHeading = heading;
    };
    new MutationObserver(capture).observe(document, {
      childList: true,
      subtree: true,
    });
    capture();
  });

  const browserDiagnostics: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      const { columnNumber, lineNumber, url } = message.location();
      browserDiagnostics.push(
        `${message.text()} (${url}:${lineNumber}:${columnNumber})`,
      );
    }
  });
  page.on("pageerror", (error) => browserDiagnostics.push(error.message));

  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window as typeof window & { __ssrHeading?: Element };
        return Boolean(state.__ssrHeading);
      }),
    )
    .toBe(true);
  const ssrHeading = await page.evaluateHandle(() => {
    const state = window as typeof window & { __ssrHeading?: Element };
    return state.__ssrHeading;
  });
  await expect(
    page.getByRole("heading", { name: "eyemono.svg" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      (heading) => document.querySelector("h1") === heading,
      ssrHeading,
    ),
  ).toBe(true);
  await page.getByRole("tab", { name: "eye" }).click();
  await expect(
    page.getByRole("radiogroup", { name: "eyebrow type" }),
  ).toBeVisible();

  expect(
    browserDiagnostics.map((message) => message.trim()).filter(Boolean),
  ).toEqual([
    expect.stringMatching(
      /^Evaluating a string as JavaScript violates the following Content Security Policy directive because 'unsafe-eval' is not an allowed source of script: script-src 'self' 'nonce-[a-f0-9]+' 'wasm-unsafe-eval' https:\/\/cdn\.jsdelivr\.net"\.$/,
    ),
  ]);
});

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

test("rejects an invalid encoded icon state on image routes", async ({
  request,
}) => {
  for (const path of [
    "/image?f=svg&p=invalid",
    "/image.svg?p=invalid",
    "/ogp?p=invalid",
  ]) {
    const response = await request.get(path);

    expect(response.status()).toBe(400);
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
  const tabIndicator = page.locator(
    '[data-scope="tabs"][data-part="indicator"]',
  );
  await expect(tabIndicator).toBeVisible();
  const initialIndicatorBox = await tabIndicator.boundingBox();
  expect(initialIndicatorBox?.width).toBeGreaterThan(0);

  await page.getByRole("tab", { name: "eye" }).click();

  await expect(
    page.getByRole("radiogroup", { name: "eyebrow type" }),
  ).toBeVisible();
  await expect
    .poll(async () => (await tabIndicator.boundingBox())?.x)
    .not.toBe(initialIndicatorBox?.x);
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

test("switches an open top-level menu on hover", async ({ page }) => {
  await page.goto("/");
  const fileMenu = page.getByRole("menuitem", { name: "File", exact: true });
  const editMenu = page.getByRole("menuitem", { name: "Edit", exact: true });

  await fileMenu.click();
  await expect(
    page.getByRole("menuitem", { name: /Copy as SVG/ }),
  ).toBeVisible();

  await editMenu.hover();

  await expect(page.getByRole("menuitem", { name: /Undo/ })).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: /Copy as SVG/ }),
  ).toBeHidden();
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
  const checkboxControl = automaticColor
    .locator("..")
    .locator('[data-part="control"]');
  await expect(checkboxControl).toHaveCSS("outline-style", "solid");
  await expect(checkboxControl).toHaveCSS("outline-width", "2px");

  await page.keyboard.press("Space");

  await expect(automaticColor).not.toBeChecked();
  await expect(colorInput).toBeEnabled();
  await page.keyboard.press("Tab");
  await expect(colorInput).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    colorInput.locator("..").getByRole("button", { name: "Reset" }),
  ).toBeFocused();
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

test("requests permission when the first camera enumeration resolves after mount", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let resolveInitialEnumeration: (devices: MediaDeviceInfo[]) => void =
      () => {};
    const initialEnumeration = new Promise<MediaDeviceInfo[]>((resolve) => {
      resolveInitialEnumeration = resolve;
    });
    let enumerationCount = 0;
    let permissionRequestCount = 0;
    const createCamera = (deviceId: string, label: string) =>
      ({
        deviceId,
        groupId: deviceId ? "test-group" : "",
        kind: "videoinput",
        label,
        toJSON: () => ({}),
      }) satisfies MediaDeviceInfo;

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        addEventListener: () => {},
        enumerateDevices: () => {
          enumerationCount += 1;
          if (enumerationCount === 1) return initialEnumeration;
          return Promise.resolve([createCamera("test-camera", "Test Camera")]);
        },
        getUserMedia: async () => {
          permissionRequestCount += 1;
          return {
            getTracks: () => [{ stop: () => {} }],
          } as unknown as MediaStream;
        },
        removeEventListener: () => {},
      },
    });
    Object.assign(window, {
      cameraTest: {
        permissionRequestCount: () => permissionRequestCount,
        resolveInitialEnumeration: () =>
          resolveInitialEnumeration([createCamera("", "")]),
      },
    });
  });

  await page.goto("/");
  await page.getByRole("tab", { name: "camera" }).click();
  await expect(
    page.getByRole("combobox", { name: "camera input" }),
  ).toBeVisible();

  await page.evaluate(() => {
    const cameraTest = (
      window as typeof window & {
        cameraTest: { resolveInitialEnumeration: () => void };
      }
    ).cameraTest;
    cameraTest.resolveInitialEnumeration();
  });

  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & {
            cameraTest: { permissionRequestCount: () => number };
          }
        ).cameraTest.permissionRequestCount(),
      ),
    )
    .toBe(1);
  const cameraSelect = page.getByRole("combobox", { name: "camera input" });
  await cameraSelect.click();
  await page.getByRole("option", { name: "Test Camera" }).click();
  await expect(cameraSelect).toContainText("Test Camera");
  await expect(page.locator("video[playsinline][muted]")).toBeAttached();
});

test("shows a retryable error when camera permission is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const hiddenCamera = {
      deviceId: "",
      groupId: "",
      kind: "videoinput",
      label: "",
      toJSON: () => ({}),
    } satisfies MediaDeviceInfo;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        addEventListener: () => {},
        enumerateDevices: async () => [hiddenCamera],
        getUserMedia: async () => {
          throw new DOMException("Permission denied", "NotAllowedError");
        },
        removeEventListener: () => {},
      },
    });
  });

  await page.goto("/");
  await page.getByRole("tab", { name: "camera" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("camera denied: Permission denied");
  await expect(
    page.getByRole("button", { name: "retry camera access" }),
  ).toBeVisible();
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
