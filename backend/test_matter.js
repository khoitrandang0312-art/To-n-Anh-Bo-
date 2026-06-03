const matter = require('gray-matter');

const file1 = `---
equation: "C_n^k = \\\\frac{n!}{k!(n-k)!}"
---`;

const file2 = `---
equation: 'C_n^k = \\frac{n!}{k!(n-k)!}'
---`;

const file3 = `---
equation: C_n^k = \\frac{n!}{k!(n-k)!}
---`;

console.log("File 1 (Double quotes + double backslash):", matter(file1).data.equation);
console.log("File 2 (Single quotes + single backslash):", matter(file2).data.equation);
console.log("File 3 (No quotes):", matter(file3).data.equation);
