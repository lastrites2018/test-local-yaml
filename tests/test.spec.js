import { test } from "@playwright/test";

let page;
test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ browser, baseURL }) => {
  page = await browser.newPage();
  // if (!baseURL) {
  //   // test.fail(true, "playwright.config.ts 에서 baseURL 설정이 필요합니다.");
  //   return;
  // }
  // await page.goto(baseURL);
});

test.describe("테스트 1", () => {
  test("테스트 코드", async () => {
    const headerExist = page.locator("App-header").isVisible();

    await test.fail(!headerExist, "헤더가 없습니다.");
  });
});
