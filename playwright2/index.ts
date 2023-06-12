import * as playwright from 'playwright';
import * as syphonx from 'syphonx-core';
import { promises as fs } from "fs";
import { ExtractState, invokeAsyncMethod } from 'syphonx-core';

const url = 'https://www.example.com/';
const template = JSON.parse(await fs.readFile('./template.json', 'utf-8'));
const script = new Function('state', `return ${syphonx.script}(state)`) as (state: ExtractState) => ExtractState;

const browser = await playwright.chromium.launch();
const page = await browser.newPage();

const result = await syphonx.execute({
    url,
    template,
    onExtract: async state => {
        const result = await page.evaluate<ExtractState, ExtractState>(script, state);
        return result;
    },
    onGoback: async ({ timeout, waitUntil }) => {
        const response = await page.goBack({ timeout, waitUntil });
        const status = response?.status();
        return { status };
    },
    onHtml: async () => {
        const html = await page.evaluate(() => document.querySelector("*")!.outerHTML);
        return html;
    },
    onLocator: async ({ frame, selector, method, params }) => {
        let locator = undefined as playwright.Locator | undefined;
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
        let clip: { x: number, y: number, height: number, width: number } | undefined = undefined;
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
