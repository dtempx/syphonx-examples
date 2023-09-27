import * as playwright from 'playwright';
import * as dotenv from 'dotenv';
import * as syphonx from 'syphonx-lib';
import { SyphonXApi, invokeAsyncMethod } from 'syphonx-lib';
dotenv.config();
const api = new SyphonXApi(process.env.SYPHONX_API_KEY);
const template = process.argv[2] || 'examples/example.json';
const url = process.argv[3];
const script = new Function('state', `return ${syphonx.script}(state)`);
const browser = await playwright.chromium.launch({ headless: false });
const page = await browser.newPage();
const result = await api.run({
    template,
    url,
    unwrap: true,
    onExtract: async (state) => {
        const result = await page.evaluate(script, state);
        return result;
    },
    onGoback: async ({ timeout, waitUntil }) => {
        const response = await page.goBack({ timeout, waitUntil });
        const status = response?.status();
        return { status };
    },
    onHtml: async () => {
        const html = await page.evaluate(() => document.querySelector("*").outerHTML);
        return html;
    },
    onLocator: async ({ frame, selector, method, params }) => {
        let locator = undefined;
        if (frame)
            locator = await page.frameLocator(frame).locator(selector);
        else
            locator = await page.locator(selector);
        const result = await invokeAsyncMethod(locator, method, params);
        return result;
    },
    onNavigate: async ({ url, timeout, waitUntil }) => {
        const response = await page.goto(url, { timeout, waitUntil });
        const status = response?.status();
        return { status };
    },
    onReload: async ({ timeout, waitUntil }) => {
        const response = await page.reload({ timeout, waitUntil });
        const status = response?.status();
        return { status };
    },
    onScreenshot: async ({ selector, fullPage, ...options }) => {
        const path = `./screenshots/${new Date().toLocaleString("en-US", { hour12: false }).replace(/:/g, "-").replace(/\//g, "-").replace(/,/g, "")}.png`;
        let clip = undefined;
        if (selector)
            clip = await page.evaluate(() => document.querySelector(selector)?.getBoundingClientRect());
        await page.screenshot({ ...options, path, clip, fullPage });
    },
    onYield: async ({ timeout, waitUntil }) => {
        await page.waitForLoadState(waitUntil, { timeout });
    }
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
//# sourceMappingURL=index.js.map