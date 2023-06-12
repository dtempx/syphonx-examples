import * as playwright from 'playwright';
import * as syphonx from 'syphonx-core';
import { promises as fs } from "fs";
const url = 'https://www.example.com/';
const template = JSON.parse(await fs.readFile('./template.json', 'utf-8'));
const script = new Function('state', `return ${syphonx.script}(state)`);
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
const result = await syphonx.execute({
    url,
    template,
    onExtract: async (state) => {
        const result = await page.evaluate(script, state);
        return result;
    },
    onGoback: async () => {
        await page.goBack();
    },
    onHtml: async () => {
        const html = await page.evaluate(() => document.querySelector("*").outerHTML);
        return html;
    },
    onLocator: async (locators) => {
        const result = {};
        for (const { name, selector, frame, method, params } of locators) {
            let locator = undefined;
            if (frame)
                locator = await page.frameLocator(frame).locator(selector);
            else
                locator = await page.locator(selector);
            result[name] = await invokeAsyncMethod(locator, method, params);
        }
        return result;
        async function invokeAsyncMethod(obj, method, args = []) {
            const fn = obj[method];
            if (typeof fn === 'function') {
                const result = await fn(...args);
                return result;
            }
        }
    },
    onNavigate: async ({ url, timeout, waitUntil }) => {
        let status = 0;
        const listener = (response) => {
            if (response.url() === url)
                status = response.status();
        };
        await page.on('response', listener);
        await page.goto(url, { timeout, waitUntil });
        if (waitUntil)
            await page.waitForURL(url, { timeout, waitUntil });
        await page.off('response', listener);
        return { status };
    },
    onReload: async () => {
        await page.reload();
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