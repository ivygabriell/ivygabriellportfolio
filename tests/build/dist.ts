import { existsSync, readFileSync } from 'node:fs';

export const read = (path: string) => readFileSync(`dist/${path}`, 'utf8');
export const exists = (path: string) => existsSync(`dist/${path}`);
