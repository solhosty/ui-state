import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { chromium } from 'playwright'

const chromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/** Captures a user-authenticated Playwright session without reading an existing browser profile. */
export async function captureSessionState(targetUrl: string, sessionStatePath: string): Promise<void> {
  const browser = await chromium.launch({
    headless: false,
    ...(existsSync(chromeExecutable) ? { executablePath: chromeExecutable } : {}),
  })
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    console.log('\nComplete login and any MFA in the opened browser. This tool will not read your normal browser profile.')
    const prompt = createInterface({ input, output })
    await prompt.question('When the authenticated screen is ready, press Enter to save this isolated session: ')
    prompt.close()
    await mkdir(dirname(sessionStatePath), { recursive: true })
    await context.storageState({ path: sessionStatePath })
    console.log(`Saved local session state to ${sessionStatePath}`)
  } finally {
    await browser.close()
  }
}
