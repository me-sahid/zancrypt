const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Product/Product.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Remove all bold/semibold
content = content.replace(/font-bold/g, 'font-normal');
content = content.replace(/font-semibold/g, 'font-normal');

// Text fill animation fix for theme switching
content = content.replace(/{ color: '#444456' }/g, "{ color: 'var(--color-void)' }");
content = content.replace(/{ color: '#e8e8f0' }/g, "{ color: 'var(--color-text-primary)' }");

// Orange buttons
// For Hero:
content = content.replace(/bg-text-primary text-void hover:bg-white/g, 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 border-none');
// For CTA:
content = content.replace(/bg-accent text-void hover:bg-white/g, 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20 border-none');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed Product.jsx!');
