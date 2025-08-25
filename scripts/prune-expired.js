#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Security: Validate file paths and inputs
const validateDate = (dateString) => {
    if (typeof dateString !== 'string') return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

const validateFilePath = (filePath) => {
    const resolvedPath = path.resolve(filePath);
    const projectRoot = path.resolve(__dirname, '..');
    return resolvedPath.startsWith(projectRoot);
};

const filePath = path.join(__dirname, '..', 'index.html');

// Security: Validate file path before reading
if (!validateFilePath(filePath)) {
    console.error('Error: Invalid file path detected');
    process.exit(1);
}

let html;
try {
    html = fs.readFileSync(filePath, 'utf8');
} catch (error) {
    console.error('Error reading file:', error.message);
    process.exit(1);
}

// Regex to find <article ... data-expires="YYYY-MM-DD" ...> ... </article>
const articleRegex = /<article\b[^>]*data-expires="(\d{4}-\d{2}-\d{2})"[^>]*>[\s\S]*?<\/article>/g;

let changed = false;
const now = new Date();

html = html.replace(articleRegex, (match, expires) => {
  // Security: Validate date before processing
  if (!validateDate(expires)) {
    console.warn(`Warning: Invalid date format found: ${expires}`);
    return match;
  }
  
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