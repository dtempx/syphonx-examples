import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { SyphonXApi } from 'syphonx-lib';

dotenv.config();

const api = new SyphonXApi(process.env.SYPHONX_API_KEY);

const template = process.argv[2] || 'examples/example.json';
const html = await fs.readFile(process.argv[3] || './example.html', 'utf8');
const unwrap = true;

const result = await api.run({ template, html, unwrap });
console.log(JSON.stringify(result, null, 2));
