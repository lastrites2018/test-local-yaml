import { chromium, FullConfig } from '@playwright/test'

const id = process.env.REACT_APP_CLIENT_ID || ''
const pwd = process.env.REACT_APP_CLIENT_PWD || ''
const waitingApiResponseUrl = '**/auth/login'

const loginURL = process.env.loginURL
console.log('loginURL: ', loginURL)

async function globalSetup(config: FullConfig) {
    const { baseURL, storageState } = config.projects[0].use
    const browser = await chromium.launch()
    // const browser = await chromium.launch({ slowMo: 1000 }) // 천천히 실행하고 싶을 경우 사용, 이 경우엔 1초 지연
    const page = await browser.newPage()
    await page.goto(loginURL!)
    console.log('video', await page?.video()?.path())

    // await page.goto(baseURL!)
    await page.type('input[type="phoneNumber"]', id)
    await page.type('input[type="password"]', pwd)
    await Promise.all([
        page.waitForResponse(waitingApiResponseUrl),
        page
            .getByRole('button', { name: '로그인', exact: true })
            .filter({ has: page.locator('span') })
            .click()
    ])
    //   await page.waitForTimeout(2000);
    await page.waitForTimeout(6000)
    console.log('로그인 됐을까?')
    await page
        .getByRole('button', { name: '감정평가 의뢰', exact: true })
        .filter({ has: page.locator('span') })
        .click()
    //   await page.waitForTimeout(2000);
    await page.waitForTimeout(6000)
    await page.context().storageState({ path: storageState as string })
    await browser.close()
}

export default globalSetup
