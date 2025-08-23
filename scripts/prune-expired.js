#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Regex to find <article ... data-expires="YYYY-MM-DD" ...> ... </article>
const articleRegex = /<article\b[^>]*data-expires="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<\/article>/g;

let changed = false;
const now = new Date();

html = html.replace(articleRegex, (match, expires) => {
  const endOfDay = new Date(expires + 'T23:59:59Z');
  if (isNaN(endOfDay.getTime())) return match;
  if (new Date() > endOfDay) {
    changed = true;
    return '';
  }
  return match;
});

if (changed) {
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Expired articles pruned.');
} else {
  console.log('No expired articles to prune.');
}