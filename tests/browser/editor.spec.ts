import { expect, test } from "@playwright/test";

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
