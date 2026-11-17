// A small, safe markdown renderer for bounty descriptions and rules.
// Everything is HTML-escaped first; the renderer then re-introduces a fixed
// set of tags (headings, paragraphs, lists, quotes, code, bold, italic and
// http(s) links). No raw HTML from the API can reach the page.

import { esc } from './format.js';

function inline(text) {
  let out = esc(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

export function markdown(source) {
  const lines = String(source ?? '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let list = null; // 'ul' | 'ol' while a list is open
  let code = null; // array of lines while a fenced block is open
  let para = [];

  const closeList = () => {
    if (list) html.push(`</${list}>`);
    list = null;
  };
  const flushPara = () => {
    if (para.length) html.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith('```')) {
        html.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }
    if (line.trim().startsWith('```')) {
      flushPara();
      closeList();
      code = [];
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = Math.min(heading[1].length + 1, 4); // page title is the h1
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushPara();
      closeList();
      html.push('<hr>');
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) {
        closeList();
        html.push(`<${kind}>`);
        list = kind;
      }
      html.push(`<li>${inline((bullet || numbered)[1])}</li>`);
      continue;
    }
    if (line.trim().startsWith('>')) {
      flushPara();
      closeList();
      html.push(`<blockquote>${inline(line.trim().replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }
    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    para.push(line.trim());
  }
  if (code) html.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
  flushPara();
  closeList();
  return html.join('\n');
}
