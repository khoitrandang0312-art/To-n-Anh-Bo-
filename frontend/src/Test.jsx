import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function TestKaTeX() {
  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h3>{String.raw`1. \frac{-b \pm \sqrt{\Delta}}{2a}`}</h3>
        <BlockMath math={String.raw`x = \frac{-b \pm \sqrt{\Delta}}{2a}`} />
      </div>
      <div>
        <h3>2. \\frac-b\\pm\\sqrt\\Delta2a (No braces)</h3>
        <BlockMath math={String.raw`x = \frac-b\pm\sqrt\Delta2a`} />
      </div>
      <div>
        <h3>3. \\f (Form feed)</h3>
        <BlockMath math={String.raw`x = \frac{-b \pm \sqrt{\Delta}}{2a}`} />
      </div>
      <div>
        <h3>4. Double escaped</h3>
        <BlockMath math={"x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}"} />
      </div>
    </div>
  )
}
