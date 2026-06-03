import katex from 'katex';

function autoFixLatex(latex) {
  if (!latex) return '';
  return latex
    .replace(/\\c\s*u\s*p/g, '\\cup')
    .replace(/\\c\{u\}p/g, '\\cup')
    .replace(/\\c\s*a\s*p/g, '\\cap')
    .replace(/\\c\{a\}p/g, '\\cap');
}

function renderKatexHtml(math, displayMode = false) {
  try {
    return katex.renderToString(math, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false
    });
  } catch {
    return null;
  }
}

function shouldUseDisplayStyle(math) {
  return /\\(?:frac|dfrac|tfrac|binom|sum|prod|int|lim)\b/.test(math);
}

function prepareInlineMath(math) {
  const fixedMath = autoFixLatex(math).trim();
  const alreadyHasStyle = /\\(?:displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b/.test(fixedMath);

  if (shouldUseDisplayStyle(fixedMath) && !alreadyHasStyle) {
    return `\\displaystyle ${fixedMath}`;
  }

  return fixedMath;
}

export function renderInlineMath(math, key) {
  const fixedMath = prepareInlineMath(math);
  const html = renderKatexHtml(fixedMath, false);

  if (!html) {
    return (
      <span key={key} className="font-mono text-sm text-red-600">
        {fixedMath}
      </span>
    );
  }

  return (
    <span
      key={key}
      className="align-baseline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function renderBlockMath(math, key) {
  const fixedMath = autoFixLatex(math);
  const html = renderKatexHtml(fixedMath, true);

  if (!html) {
    return (
      <pre
        key={key}
        className="my-3 overflow-x-auto rounded bg-red-50 p-3 font-mono text-sm text-red-600"
      >
        {fixedMath}
      </pre>
    );
  }

  return (
    <div
      key={key}
      className="my-3 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderPlainText(text, keyPrefix) {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);

    return (
      <span key={`${keyPrefix}-line-${lineIndex}`}>
        {boldParts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={`${keyPrefix}-strong-${lineIndex}-${partIndex}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }

          return (
            <span key={`${keyPrefix}-text-${lineIndex}-${partIndex}`}>
              {part}
            </span>
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

function renderInlineTextWithMath(text, keyPrefix) {
  const inlineParts = text.split(/\$(.*?)\$/g);

  return inlineParts.map((part, index) => {
    if (index % 2 === 1) {
      return renderInlineMath(part, `${keyPrefix}-inline-${index}`);
    }

    return renderPlainText(part, `${keyPrefix}-plain-${index}`);
  });
}

function renderMathTextBlock(text, keyPrefix) {
  const blockParts = text.split(/\$\$(.*?)\$\$/gs);

  return blockParts.map((part, index) => {
    if (index % 2 === 1) {
      return renderBlockMath(part, `${keyPrefix}-block-${index}`);
    }

    return renderInlineTextWithMath(part, `${keyPrefix}-text-${index}`);
  });
}

function renderCodeBlock(language, code, key) {
  const isTikz = /\\begin\{tikzpicture\}|\\draw|\\coordinate/.test(code);

  if (isTikz) return null;

  return (
    <details
      key={key}
      className="my-4 rounded-lg border border-slate-200 bg-slate-50 text-sm"
      open
    >
      <summary className="cursor-pointer select-none px-3 py-2 font-semibold text-slate-600">
        {`Mã ${language || 'code'}`}
      </summary>
      <pre className="max-h-80 overflow-auto border-t border-slate-200 p-3 text-xs leading-relaxed text-slate-700">
        <code>{code.trim()}</code>
      </pre>
    </details>
  );
}

export function renderTextWithMath(text) {
  if (!text) return null;

  const cleanedText = text.replace(/Sf\(x\)/g, '$f(x)');
  const codeFencePattern = /```([A-Za-z0-9_-]+)?[^\S\n]*\n([\s\S]*?)(?:```|$)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let index = 0;

  while ((match = codeFencePattern.exec(cleanedText)) !== null) {
    const before = cleanedText.slice(lastIndex, match.index);

    if (before) {
      nodes.push(renderMathTextBlock(before, `md-${index}`));
    }

    nodes.push(renderCodeBlock(match[1], match[2], `code-${index}`));
    lastIndex = codeFencePattern.lastIndex;
    index += 1;
  }

  const after = cleanedText.slice(lastIndex);

  if (after) {
    nodes.push(renderMathTextBlock(after, `md-${index}`));
  }

  return nodes;
}

export function renderAnswer(answer) {
  if (!answer) return null;

  let cleanedAnswer = String(answer).trim();

  if (cleanedAnswer.startsWith('$') && cleanedAnswer.endsWith('S')) {
    cleanedAnswer = `${cleanedAnswer.slice(0, -1)}$`;
  }

  if (cleanedAnswer.includes('$')) {
    return renderTextWithMath(cleanedAnswer);
  }

  return renderInlineMath(cleanedAnswer, `answer-${cleanedAnswer}`);
}
