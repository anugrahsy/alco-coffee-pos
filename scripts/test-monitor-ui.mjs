import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// Optional audit runner: keep Playwright outside production dependencies.
const { chromium } = await import(process.env.MONITOR_PLAYWRIGHT_MODULE ?? 'playwright')
const artifacts = await mkdtemp(join(tmpdir(), 'alco-monitor-'))
const baseURL = process.env.MONITOR_BASE_URL ?? 'http://127.0.0.1:3000'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.clock.setFixedTime(new Date('2026-10-17T12:00:00+07:00'))
const errors = [], warnings = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'warning' || message.type() === 'warn') warnings.push(message.text()) })
await page.goto(baseURL + '/monitor')
await page.getByText('Contoh Data', { exact: true }).waitFor()
// Desktop rail must neither scroll internally nor forward a wheel gesture to the document.
for (const height of [900, 520]) {
  await page.setViewportSize({ width: 1440, height })
  await page.waitForTimeout(100)
  await page.locator('main').evaluate(el => el.parentElement.scrollTo(0, 0))
  const sidebar = page.locator('aside').first()
  const before = await sidebar.evaluate(el => ({ page: scrollY, top: el.getBoundingClientRect().top, internal: [...el.querySelectorAll('div')].map(node => node.scrollTop) }))
  const box = await sidebar.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 240))
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(120)
  assert.deepEqual(await sidebar.evaluate(el => ({ page: scrollY, top: el.getBoundingClientRect().top, internal: [...el.querySelectorAll('div')].map(node => node.scrollTop) })), before)
  const zoomPrevented = await sidebar.evaluate(el => { const event = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true }); el.dispatchEvent(event); return event.defaultPrevented })
  assert.equal(zoomPrevented, false)
  await page.mouse.move(1000, Math.min(400, height - 40))
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(120)
  assert.ok(await page.locator('main').evaluate(el => el.parentElement.scrollTop > 0), 'Main pane must still scroll')
  assert.equal(await page.evaluate(() => scrollY), 0, 'Document must stay still')
  assert.equal((await sidebar.boundingBox()).y, box.y, 'Sidebar must stay still while main scrolls')
  await page.locator('main').evaluate(el => el.parentElement.scrollTo(0, el.parentElement.scrollHeight))
  await page.waitForTimeout(100)
  assert.equal((await sidebar.boundingBox()).y, box.y, 'Sidebar must stay still at content bottom')
  assert.equal(await page.evaluate(() => scrollY), 0)
  console.log(`PASS stationary sidebar / isolated main scroll / wheel lock / zoom at ${height}px height`)
}
await page.locator('main').evaluate(el => el.parentElement.scrollTo(0, 0))
for (const width of [360, 390, 768, 820, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: 1000 })
  for (const period of ['Hari ini', 'Minggu ini', 'Bulan ini', 'Tahun ini']) {
    await page.getByRole('radio', { name: period, exact: true }).click()
    await page.waitForTimeout(100)
    const caption = { 'Hari ini': 'vs kemarin', 'Minggu ini': 'vs minggu lalu', 'Bulan ini': 'vs bulan lalu', 'Tahun ini': 'vs tahun lalu' }[period]
    const kpis = ['Pendapatan penjualan', 'Estimasi Laba Kotor', 'Estimasi Laba Bersih', 'Rata-rata tagihan']
    for (const title of kpis) {
      const card = page.locator('main section').filter({ has: page.getByText(title, { exact: true }) })
      assert.equal(await card.getByText(caption, { exact: true }).count(), 1)
      assert.match(await card.locator('span.rounded-full').textContent(), /^[+-]?[\d.,]+%$/)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, `${width} ${period} overflow`)
    for (const title of ['Pendapatan', 'Order dibayar', 'Jam ramai']) {
      const card = page.getByRole('region', { name: title, exact: true })
      const chart = card.locator('.recharts-wrapper')
      const box = await chart.boundingBox()
      assert.ok(box.width >= 150 && box.height >= 120, `${width} ${title} collapsed: ${JSON.stringify(box)}`)
      const badPaths = await chart.locator('path').evaluateAll(elements => elements.filter(element => /NaN|Infinity/.test(element.getAttribute('d') ?? '')).length)
      assert.equal(badPaths, 0)
    }
    assert.ok(await page.getByRole('region', { name: 'Pendapatan', exact: true }).locator('.recharts-line-curve').count() > 0)
    console.log(`PASS geometry/overflow ${width}px ${period}`)
  }
  await page.screenshot({ path: `${artifacts}/monitor-final-${width}.png`, fullPage: true })
}
await page.setViewportSize({ width: 1440, height: 1000 })
await page.getByRole('radio', { name: 'Hari ini', exact: true }).click()
const revenue = page.getByRole('region', { name: 'Pendapatan', exact: true })
const chartBox = await revenue.locator('.recharts-wrapper').boundingBox()
await page.mouse.move(chartBox.x + chartBox.width * 0.6, chartBox.y + chartBox.height * 0.5)
await revenue.locator('.recharts-tooltip-wrapper').getByText(/Rp/).waitFor()
await revenue.locator('svg[role="application"]').focus()
await page.keyboard.press('ArrowRight')
await revenue.locator('.recharts-tooltip-wrapper').getByText(/Rp/).waitFor()
console.log('PASS revenue hover and keyboard tooltip')
const payments = page.getByRole('region', { name: 'Metode pembayaran', exact: true })
for (const name of ['Tunai', 'QRIS Manual', 'Transfer Manual']) assert.equal(await payments.getByRole('button', { name: new RegExp('^' + name + ',') }).count(), 1)
for (const button of await payments.getByRole('button').all()) {
  const layout = await button.evaluate(el => {
    const icon = el.querySelector(':scope > svg').getBoundingClientRect()
    const label = el.querySelector(':scope > span > span').getBoundingClientRect()
    return { gap: label.left - icon.right, height: el.getBoundingClientRect().height }
  })
  assert.ok(layout.gap >= 10 && layout.height >= 56, `Payment row spacing: ${JSON.stringify(layout)}`)
}
await payments.getByRole('button', { name: /^Tunai,/ }).scrollIntoViewIfNeeded()
await page.waitForTimeout(150)
await payments.getByRole('button', { name: /^Tunai,/ }).focus()
await page.getByRole('tooltip').waitFor()
console.log('PASS payment breakdown and focus tooltip')
await page.getByRole('radio', { name: 'Nilai', exact: true }).click()
await page.getByText('Kontributor pendapatan', { exact: true }).waitFor()
console.log('PASS distinct product revenue ranking')
await page.evaluate(() => document.documentElement.classList.add('dark'))
await page.screenshot({ path: `${artifacts}/monitor-final-dark.png`, fullPage: true })
assert.equal(await revenue.locator('.recharts-line-curve').evaluate(el => getComputedStyle(el).stroke === 'none'), false)
console.log('PASS dark chart tokens')
// Verify custom future period has genuine empty states while unpaid remains current.
await page.setViewportSize({ width: 390, height: 900 })
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'Rentang tanggal Monitor', exact: true }).click()
await page.waitForTimeout(350)
const dialog = page.getByRole('dialog', { name: 'Rentang tanggal Monitor', exact: true })
await dialog.locator('button[slot="next"]').click()
await page.waitForTimeout(200)
await dialog.getByRole('button', { name: /, 1 November 2026$/ }).click()
await dialog.getByRole('button', { name: /, 2 November 2026$/ }).click()
await dialog.getByRole('button', { name: 'Apply', exact: true }).click()
await page.getByText('Belum ada penjualan pada periode ini.', { exact: true }).waitFor()
await payments.getByText('Belum ada pembayaran pada periode ini.', { exact: true }).waitFor()
await page.getByText('Rp498.000', { exact: true }).waitFor()
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0)
console.log('PASS custom date range / empty chart / unpaid unaffected')
assert.deepEqual(errors, [])
assert.deepEqual(warnings.filter(message => /width\(0\)|height\(0\)|NaN|uncaught/i.test(message)), [])
console.log('PASS no browser errors or zero-sized chart warnings')
console.log('Screenshots:', artifacts)
await browser.close()

