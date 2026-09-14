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

test("preserves generated image URL response contracts", async ({
  request,
}) => {
  const routes = [
    { path: "/image?f=svg", type: "image/svg+xml" },
    { path: "/image.png?s=120x240", type: "image/png", dimensions: [120, 240] },
    { path: "/image.svg", type: "image/svg+xml" },
    { path: "/ogp", type: "image/png", dimensions: [1000, 525] },
  ] as const;

  for (const route of routes) {
    const response = await request.get(route.path);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(route.type);
    expect(response.headers()["cache-control"]).toBe(
      "public, max-age=31536000",
    );

    if ("dimensions" in route) {
      const body = await response.body();
      expect(body.readUInt32BE(16)).toBe(route.dimensions[0]);
      expect(body.readUInt32BE(20)).toBe(route.dimensions[1]);
    }
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

test("rejects repeated image query parameters", async ({ request }) => {
  for (const path of [
    "/image?f=invalid&f=svg",
    "/image?p=invalid&p=",
    "/image?s=invalid&s=120",
  ]) {
    const response = await request.get(path);

    expect(response.status()).toBe(400);
  }
});

test("does not treat near-match image paths as image routes", async ({
  request,
}) => {
  for (const path of ["/image.pngx", "/image.svg/extra"]) {
    const response = await request.get(path);

    expect(response.status()).toBe(404);
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

test("saves the latest state with autosave disabled and explicit Save", async ({
  page,
}) => {
  await page.goto("/");
  await expect.poll(() => page.url()).toContain("?p=");
  const savedUrl = page.url();

  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Auto save" }).click();
  await page.getByRole("radio", { name: "Ponytail", exact: true }).check({
    force: true,
  });
  await expect(page).toHaveURL(savedUrl);

  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitem", { name: "Save", exact: true }).click();
  await expect.poll(() => page.url()).not.toBe(savedUrl);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Ponytail", exact: true }),
  ).toBeChecked();
});

test("resumes autosave with the latest state after it is turned back on", async ({
  page,
}) => {
  await page.goto("/");
  await expect.poll(() => page.url()).toContain("?p=");
  const savedUrl = page.url();

  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Auto save" }).click();
  await page.getByRole("radio", { name: "Ponytail", exact: true }).check({
    force: true,
  });
  await expect(page).toHaveURL(savedUrl);

  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Auto save" }).click();
  await expect.poll(() => page.url()).not.toBe(savedUrl);
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Ponytail", exact: true }),
  ).toBeChecked();
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
    let resolveInitialEnumeration: (
      devices: MediaDeviceInfo[],
    ) => void = () => {};
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

test("does not intercept native undo in a color input", async ({ page }) => {
  await page.goto("/");
  const color = page.locator('input[type="color"]').first();

  await color.fill("#123456");
  await expect(color).toHaveValue("#123456");
  await color.evaluate((input) => {
    input.addEventListener("keydown", (event) => {
      input.dataset.undoDefaultPrevented = String(event.defaultPrevented);
    });
  });

  await page.keyboard.press("Control+Z");

  await expect(color).toHaveAttribute("data-undo-default-prevented", "false");
  await expect(color).toHaveValue("#123456");
});

test("runs Undo and Redo from their application shortcuts", async ({
  page,
}) => {
  await page.goto("/");
  const initialHair = page.getByRole("radio", {
    name: "Default",
    exact: true,
  });
  const ponytail = page.getByRole("radio", {
    name: "Ponytail",
    exact: true,
  });

  await ponytail.check({ force: true });
  await page.getByRole("menuitem", { name: "Edit", exact: true }).focus();
  await page.keyboard.press("Control+Z");
  await expect(initialHair).toBeChecked();

  await page.keyboard.press("Control+Shift+Z");
  await expect(ponytail).toBeChecked();
});

test("runs file commands from their application shortcuts", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.keyboard.press("Control+Shift+C");
  await expect(page.getByText("copied as SVG!", { exact: true })).toBeVisible();

  await page.keyboard.press("Control+Alt+C");
  await expect(
    page.getByText("copied SVG url!", { exact: true }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.keyboard.press("Control+Shift+S");
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("icon.svg");
});

test("randomizes the icon with a non-reload shortcut", async ({ page }) => {
  await page.goto("/");
  const icon = page.locator("#icon-svg");
  const initialIcon = await icon.innerHTML();

  await page.keyboard.press("Control+Shift+L");

  await expect.poll(() => icon.innerHTML()).not.toBe(initialIcon);
});

test("shows centralized platform shortcut labels in the menus", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Copy as SVG Ctrl + Shift + C" }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Download as..." }).hover();
  await expect(
    page.getByRole("menuitem", {
      name: "Download as SVG Ctrl + Shift + S",
    }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Share" }).hover();
  await expect(
    page.getByRole("menuitem", { name: "Copy SVG url Ctrl + Alt + C" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Undo Ctrl + Z" }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Redo Ctrl + Shift + Z" }),
  ).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "Randomize Ctrl + Shift + L" }),
  ).toBeVisible();
});

test("does not run application shortcuts from editable elements", async ({
  page,
}) => {
  await page.goto("/");
  const ponytail = page.getByRole("radio", {
    name: "Ponytail",
    exact: true,
  });
  await ponytail.check({ force: true });
  await page.evaluate(() => {
    const container = document.createElement("div");
    container.innerHTML = [
      '<input data-editable="text" type="text" value="editable">',
      '<textarea data-editable="textarea">editable</textarea>',
      '<select data-editable="select"><option>editable</option></select>',
      '<div data-editable="contenteditable" contenteditable="true">editable</div>',
      '<input data-editable="color" type="color" value="#123456">',
    ].join("");
    document.body.append(container);
  });
  const icon = page.locator("#icon-svg");
  const initialIcon = await icon.innerHTML();

  for (const editable of [
    "text",
    "textarea",
    "select",
    "contenteditable",
    "color",
  ]) {
    await page.locator(`[data-editable="${editable}"]`).focus();
    await page.keyboard.press("Control+Z");
    await expect(ponytail).toBeChecked();
    await page.keyboard.press("Control+Shift+L");
    expect(await icon.innerHTML()).toBe(initialIcon);
  }
});

test("preserves native text undo", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("aria-label", "native undo field");
    input.value = "editable";
    document.body.append(input);
  });
  const input = page.getByRole("textbox", { name: "native undo field" });

  await input.focus();
  await page.keyboard.press("End");
  await page.keyboard.type(" updated");
  await expect(input).toHaveValue("editable updated");

  await page.keyboard.press("Control+Z");
  await expect(input).toHaveValue("editable");
});

test("uses Command shortcuts and labels on macOS", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "platform", {
      configurable: true,
      value: "MacIntel",
    });
  });
  await page.goto("/");
  const icon = page.locator("#icon-svg");
  const initialIcon = await icon.innerHTML();

  await page.keyboard.press("Meta+Shift+L");
  await expect.poll(() => icon.innerHTML()).not.toBe(initialIcon);

  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("menuitem", {
      name: "Randomize Command + Shift + L",
    }),
  ).toBeVisible();
});
