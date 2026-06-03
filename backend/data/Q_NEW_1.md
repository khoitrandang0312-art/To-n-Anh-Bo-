---
topic: 'Toán'
chapter: 'Hình học không gian'
theme: 'Khoảng cách và Góc'
difficulty: 'Vận dụng cao'
type: 'short_answer'
---
**Câu 56.** Như hình vẽ, độ dài cạnh của hình lập phương $ABCD.A_1B_1C_1D_1$ là $\sqrt{3}$, điểm $P$ là điểm động trong tam giác $ACB_1$ (kể cả biên), $M, N$ lần lượt là trung điểm của $C_1D_1, BC$, nếu góc tạo bởi đường thẳng $BP$ và đường thẳng $MN$ là $\theta$, và $\sin \theta = \frac{\sqrt{5}}{5}$, thì diện tích hình phẳng được bao quanh bởi quỹ tích của điểm động $P$ bằng bao nhiêu?

```latex
\begin{center}
\begin{tikzpicture}[scale=1, line join=round, line cap=round]
    \coordinate (A) at (0,0);
    \coordinate (B) at (4,0);
    \coordinate (D) at (1.5,1.5);
    \coordinate (C) at (5.5,1.5);
    \coordinate (A1) at (0,4);
    \coordinate (B1) at (4,4);
    \coordinate (D1) at (1.5,5.5);
    \coordinate (C1) at (5.5,5.5);

    \coordinate (M) at ($(C1)!0.5!(D1)$);
    \coordinate (N) at ($(B)!0.5!(C)$);
    
    \coordinate (P) at (3.5, 2); 
    
    \fill[yellow!40] (A) -- (C) -- (B1) -- cycle;
    
    \draw[dashed, blue] (A) -- (D) -- (C);
    \draw[dashed, blue] (D) -- (D1);
    \draw[dashed, blue] (A) -- (C);
    
    \draw[blue, thick] (A) -- (B) -- (C) -- (C1) -- (B1) -- (A1) -- cycle;
    \draw[blue, thick] (B) -- (B1);
    \draw[blue, thick] (A1) -- (D1) -- (C1);
    \draw[blue, thick] (A) -- (B1);
    \draw[blue, thick] (B1) -- (C);
    
    \draw[dashed, blue] (M) -- (N);
    \draw[dashed, blue] (P) -- (B);
    \draw[dashed, blue] (P) -- (D); 
    
    \fill[blue] (P) circle (1pt);
    \node[left] at (A) {$A$};
    \node[below] at (B) {$B$};
    \node[right] at (C) {$C$};
    \node[left] at (D) {$D$};
    \node[left] at (A1) {$A_1$};
    \node[above left] at (B1) {$B_1$};
    \node[right] at (C1) {$C_1$};
    \node[above left] at (D1) {$D_1$};
    \node[above] at (M) {$M$};
    \node[right] at (N) {$N$};
    \node[above right] at (P) {$P$};
\end{tikzpicture}
\end{center}