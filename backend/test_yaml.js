const matter = require('gray-matter');
const yaml = `---\nequation: P(A \\cup B) = P(A) + P(B) - P(A \\cap B)\n---`;
const parsed = matter(yaml);
console.log(parsed.data.equation);
