import { marked } from 'marked';
export const mdInline = (s: string) => marked.parseInline(s) ?? s;
