import * as cheerio from 'cheerio';
import * as syphonx from 'syphonx-core';
import { promises as fs } from "fs";

const template = JSON.parse(await fs.readFile('./template.json', 'utf-8'));
const html = await fs.readFile('./example.html', 'utf-8');

const root = cheerio.load(html);
const result = await syphonx.extract({ ...template, root } as syphonx.ExtractState);
console.log(JSON.stringify(result, null, 2));
