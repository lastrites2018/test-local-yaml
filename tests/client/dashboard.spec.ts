/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

let page: Page
test.describe.configure({ mode: 'serial' })
const 테스트문구 =
    '안녕하세요. 테스트 의뢰입니다. 이 의뢰는 테스트 러너에 의해 자동으로 생성됩니다.'

test.beforeAll(async ({ browser, baseURL }) => {
    page = await browser.newPage()

    console.log('dashboard specs baseURL: ', baseURL)
    if (!baseURL) {
        test.fail(true, 'playwright.config.ts 에서 baseURL 설정이 필요합니다.')
        return
    }
    await page.goto(baseURL!)
})

test.describe('통합폼 : 예상감정 의뢰하기', async () => {
    test('예상감정 의뢰하기', async () => {
        // await page.click('text=의뢰하기')
        await page
            .getByRole('button', { name: '의뢰하기', exact: true })
            .click()
            .catch(e => console.log('e: ', e))

        // await page
        //     .getByRole('combobox', { name: '주소 검색' })
        //     .click()
        //     .catch(e => console.log('e: ', e))

        await page
            .getByTestId('담보소재지')
            .click()
            .catch(e => console.log('e: ', e))

        await page
            .locator('input[name="담보소재지"]')
            .fill('공간의가치')
            .catch(e => console.log('e: ', e))

        await page
            .getByText('테헤란로98길 8')
            .click()
            .catch(e => console.log('e: ', e))

        await page
            .getByPlaceholder('여러 필지(여러 호수)일 때 여기에 작성해주세요')
            .fill(테스트문구)
            .catch(e => console.log('e: ', e))

        await page
            .getByRole('button', { name: '의뢰', exact: true })
            .click()
            .catch(e => console.log('e: ', e))
        await page.waitForTimeout(2000)

        const textContent = await page
            .locator(
                'div[role="row"]:nth-child(2) > div[role="cell"]:nth-child(3)'
            )
            .innerText()
            .catch(e => console.log('e: ', e))
        console.log('textContent: ', textContent)

        expect(textContent).toContain('서울시 강남구 대치동 945-10')
    })
})

test.describe('통합폼 : 정식감정 의뢰하기', async () => {
    test('집합건물 주소 선택 및 물건 종류 변경 테스트', async () => {
        await page.click('text=의뢰하기')

        await page.getByRole('button', { name: '예상감정' }).click()
        await page.getByRole('option', { name: '감정평가' }).click()

        // await page.getByRole('combobox', { name: '주소 검색' }).click()
        await page
            .getByTestId('담보소재지')
            .click()
            .catch(e => console.log('e: ', e))

        await page.locator('input[name="담보소재지"]').fill('은마아파트')

        await page.getByText('구암서4길 15').click()
        await page.waitForTimeout(400)

        await page
            .getByPlaceholder('여러 필지(여러 호수)일 때 여기에 작성해주세요')
            .fill(테스트문구)

        await page.waitForTimeout(50)

        await expect
            .soft(
                page.getByTestId('물건종류'),
                '물건종류가 집합건물으로 바뀌어야 합니다.'
            )
            .toHaveText('집합건물', { useInnerText: true })
    })

    test('동 호 선택 및 의뢰 신청 테스트', async () => {
        await page.getByRole('button', { name: '동' }).click()
        await page.waitForTimeout(100)
        await page.getByRole('option', { name: '은마아파트' }).click()

        await page.waitForTimeout(100)
        await page.getByRole('button', { name: '호' }).click()
        await page.waitForTimeout(100)

        await page.getByRole('option', { name: '103호' }).click()

        await page.locator('input[name="소유자"]').fill('테스트소유자')
        await page.locator('input[name="채무자"]').fill('테스트채무자')
        await page.locator('input[name="소유자 연락처"]').fill('0212345678')
        await page.locator('input[name="채무자 연락처"]').fill('01032187654')

        await page.getByRole('button', { name: '의뢰', exact: true }).click()
        // TODO: 로딩 인디케이터가 나왔다가 사라지는 시점으로 하거나, 창이 닫히고, 데이터 수가 늘어난 이후로 변경해야 함
        await page.waitForSelector('internal:role=dialog[name="의뢰하기"i]', {
            state: 'detached'
        })

        await page.waitForTimeout(2500)

        const textContent2 = await page
            .locator(
                'div[role="row"]:nth-child(1) > div[role="cell"]:nth-child(3)'
            )
            .innerText()

        console.log('textContent2: ', textContent2)
        expect(textContent2).toContain('경남 창원시 마산회원구 구암동 16-9')
    })

    test('감정평가 의뢰 수정 테스트', async () => {
        await page.waitForTimeout(500)
        await page.waitForTimeout(2500)

        await page
            .getByRole('row', {
                name: '경남 창원시 마산회원구 구암동 16-9'
            })
            .getByText('요청함')
            .first()
            .click()

        const isExistRequester = await page
            .getByTestId('의뢰담당자')
            .innerText()

        await expect
            .soft(isExistRequester, '의뢰담당자 값이 존재해야 합니다')
            .not.toBeUndefined()

        await page.getByRole('button', { name: '수정' }).click()
        await page.waitForTimeout(100)

        await page.getByTestId('전달사항').click()
        await page.getByTestId('전달사항').press('Enter')
        await page
            .getByTestId('전달사항')
            .fill(
                '안녕하세요. 테스트 의뢰입니다. 이 의뢰는 테스트 러너에 의해 자동으로 생성됩니다.\n이 테스트는 의뢰 이후, 수정이 잘 되는지를 테스트합니다.'
            )

        await page.getByTestId('물건종류').click()
        await page.getByRole('option', { name: '토지', exact: true }).click()
        await page
            .getByRole('spinbutton', { name: '의뢰일 day' })
            .press('ArrowUp')

        await page.getByTestId('업무분류').click()
        await page.getByRole('option', { name: '기타' }).click()
        await page.getByTestId('소유자').click()
        await page.getByTestId('소유자').fill('테스트소유자수정')
        await page.getByTestId('채무자').click()
        await page.getByTestId('채무자').fill('테스트채무자수정')
        await page.getByTestId('소유자 연락처').click()
        await page.getByTestId('소유자 연락처').fill('01099998888')
        await page.getByTestId('채무자 연락처').click()
        await page.getByTestId('채무자 연락처').fill('01011113333')
        await page.getByRole('spinbutton', { name: '제출기한 month' }).click()
        await page
            .getByRole('spinbutton', { name: '제출기한 month' })
            .press('ArrowUp')
        await page.getByRole('button', { name: '수정 완료' }).click()
        await page.getByRole('button', { name: '예' }).click()

        await expect
            .soft(
                page.getByTestId('물건종류'),
                '물건종류가 토지로 바뀌어야 합니다.'
            )
            .toHaveText('토지', { useInnerText: true })

        await expect
            .soft(
                page.getByTestId('업무분류'),
                '업무분류가 기타로 바뀌어야 합니다.'
            )
            .toHaveText('기타', { useInnerText: true })

        await expect
            .soft(
                page.locator('input[name="소유자"]'),
                '소유자가 테스트소유자수정으로 바뀌어야 합니다.'
            )
            .toHaveValue('테스트소유자수정')

        await expect
            .soft(
                page.locator('input[name="채무자"]'),
                '채무자가 테스트소유자수정으로 바뀌어야 합니다.'
            )
            .toHaveValue('테스트채무자수정')

        await expect
            .soft(
                page.getByTestId('소유자 연락처'),
                '소유자 연락처가 010-9999-8888로 바뀌어야 합니다.'
            )
            .toHaveValue('010-9999-8888')
        await expect
            .soft(
                page.getByTestId('채무자 연락처'),
                '채무자 연락처가 010-1111-3333로 바뀌어야 합니다.'
            )
            .toHaveValue('010-1111-3333')
        await page.getByRole('button', { name: '창 닫기' }).click()
    })
})

test.describe('통합폼 : 사업성검토 의뢰하기', async () => {
    test('사업성검토 의뢰 & 물건 종류 토지로 변경 테스트', async () => {
        await page.waitForTimeout(2500)
        await page
            .getByRole('button', { name: '의뢰하기', exact: true })
            .click()

        await page.getByRole('button', { name: '예상감정' }).click()
        await page.waitForTimeout(100)
        await page.getByRole('option', { name: '사업성검토' }).click()

        await page
            .getByTestId('담보소재지')
            .click()
            .catch(e => console.log('e: ', e))

        await page.locator('input[name="담보소재지"]').fill('삼성동 167')

        await page.getByText('영동대로 512').click()
        await page.waitForTimeout(400)

        await page
            .getByPlaceholder('여러 필지(여러 호수)일 때 여기에 작성해주세요')
            .fill(테스트문구)

        await page.waitForTimeout(50)

        await expect
            .soft(
                page.getByTestId('물건종류'),
                '물건종류가 토지로 바뀌어야 합니다.'
            )
            .toHaveText('토지', { useInnerText: true })
    })

    test('사업성검토 의뢰 신청 테스트', async () => {
        await page.locator('input[name="소유자"]').fill('테스트소유자')
        await page.locator('input[name="채무자"]').fill('테스트채무자')
        await page.locator('input[name="소유자 연락처"]').fill('0212345678')
        await page.locator('input[name="채무자 연락처"]').fill('01032187654')

        await page.getByRole('button', { name: '의뢰', exact: true }).click()
        await page.waitForSelector('internal:role=dialog[name="의뢰하기"i]', {
            state: 'detached'
        })

        await page.waitForTimeout(2500)

        const textContent2 = await page
            .locator(
                'div[role="row"]:nth-child(1) > div[role="cell"]:nth-child(3)'
            )
            .innerText()

        console.log('textContent2: ', textContent2)
        expect(textContent2).toContain('서울시 강남구 삼성동 167')
    })

    test('사업성검토 의뢰 수정 테스트', async () => {
        await page.waitForTimeout(500)
        await page.waitForTimeout(2500)

        await page
            .getByRole('row', {
                name: '서울시 강남구 삼성동 167'
            })
            .getByText('요청함')
            .first()
            .click()

        await page.getByRole('button', { name: '수정' }).click()
        await page.waitForTimeout(100)

        await page.getByTestId('전달사항').click()
        await page.getByTestId('전달사항').press('Enter')
        await page
            .getByTestId('전달사항')
            .fill(
                '안녕하세요. 테스트 의뢰입니다. 이 의뢰는 테스트 러너에 의해 자동으로 생성됩니다.\n이 테스트는 의뢰 이후, 수정이 잘 되는지를 테스트합니다.'
            )

        await page.getByTestId('물건종류').click()
        await page.getByRole('option', { name: '집합건물' }).click()

        await page
            .getByRole('spinbutton', { name: '의뢰일 day' })
            .press('ArrowUp')

        await page.getByTestId('소유자').click()
        await page.getByTestId('소유자').fill('테스트소유자수정')
        await page.getByTestId('채무자').click()
        await page.getByTestId('채무자').fill('테스트채무자수정')
        await page.getByTestId('소유자 연락처').click()
        await page.getByTestId('소유자 연락처').fill('01099998888')
        await page.getByTestId('채무자 연락처').click()
        await page.getByTestId('채무자 연락처').fill('01011113333')
        await page.getByRole('spinbutton', { name: '제출기한 month' }).click()
        await page
            .getByRole('spinbutton', { name: '제출기한 month' })
            .press('ArrowUp')
        await page.getByRole('button', { name: '수정 완료' }).click()
        await page.getByRole('button', { name: '예' }).click()

        await expect
            .soft(
                page.getByTestId('물건종류'),
                '물건종류가 집합건물으로 바뀌어야 합니다.'
            )
            .toHaveText('집합건물', { useInnerText: true })

        await expect
            .soft(
                page.locator('input[name="소유자"]'),
                '소유자가 테스트소유자수정으로 바뀌어야 합니다.'
            )
            .toHaveValue('테스트소유자수정')

        await expect
            .soft(
                page.locator('input[name="채무자"]'),
                '채무자가 테스트소유자수정으로 바뀌어야 합니다.'
            )
            .toHaveValue('테스트채무자수정')

        await expect
            .soft(
                page.getByTestId('소유자 연락처'),
                '소유자 연락처가 010-9999-8888로 바뀌어야 합니다.'
            )
            .toHaveValue('010-9999-8888')
        await expect
            .soft(
                page.getByTestId('채무자 연락처'),
                '채무자 연락처가 010-1111-3333로 바뀌어야 합니다.'
            )
            .toHaveValue('010-1111-3333')
        await page.getByRole('button', { name: '창 닫기' }).click()
        // 클로즈 시점 변경?
        await page.close()
    })
})
