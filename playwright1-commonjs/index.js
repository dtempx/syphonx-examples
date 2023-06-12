"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playwright = require("playwright");
const syphonx = require("syphonx-core");
const fs_1 = require("fs");
(async () => {
    try {
        const url = 'https://www.example.com/';
        const template = JSON.parse(await fs_1.promises.readFile('./template.json', 'utf-8'));
        const browser = await playwright.chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const result = await page.evaluate(`${syphonx.script}(${JSON.stringify({ ...template, url })})`);
        console.log(JSON.stringify(result, null, 2));
        await browser.close();
    }
    catch (err) {
        console.error(err);
    }
})();
//# sourceMappingURL=index.js.map