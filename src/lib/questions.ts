export interface Question { q: string; options: string[]; answer: number; why: string }

export const QUESTIONS: Record<string, Question[]> = {
  "C Programming": [
    { q: "What does `sizeof(int)` return on most 32-bit microcontrollers?", options: ["2", "4", "8", "Depends on value"], answer: 1, why: "int is typically 4 bytes on 32-bit targets (e.g., ESP32, ARM Cortex-M)." },
    { q: "Which keyword prevents the compiler from optimizing away reads of a hardware register?", options: ["static", "const", "volatile", "register"], answer: 2, why: "volatile tells the compiler the value may change outside program control." },
    { q: "What is `*(p+2)` equivalent to for pointer p?", options: ["p[2]", "&p[2]", "p+2", "*p+2"], answer: 0, why: "Pointer arithmetic: *(p+i) is identical to p[i]." },
    { q: "Result of `5 >> 1` in C?", options: ["10", "2", "2.5", "1"], answer: 1, why: "Right shift by 1 is integer division by 2: 5/2 = 2." },
  ],
  Python: [
    { q: "What is the output of `len({1, 2, 2, 3})`?", options: ["4", "3", "2", "Error"], answer: 1, why: "Sets remove duplicates → {1,2,3}." },
    { q: "Which creates a list of squares 0–4?", options: ["[x^2 for x in range(5)]", "[x**2 for x in range(5)]", "list(x*x, 5)", "map(x**2, 5)"], answer: 1, why: "** is exponentiation; ^ is XOR in Python." },
    { q: "What does `a[::-1]` do for a list a?", options: ["Removes last item", "Reverses it", "Copies first item", "Error"], answer: 1, why: "A slice with step -1 returns a reversed copy." },
    { q: "Default mutable argument `def f(x=[])` is risky because…", options: ["It's slower", "The list is shared across calls", "Syntax error", "It's immutable"], answer: 1, why: "Defaults are evaluated once, so the same list persists across calls." },
  ],
  "Digital Electronics": [
    { q: "Minimum number of 2-input NAND gates for an XOR?", options: ["2", "3", "4", "5"], answer: 2, why: "XOR can be built with 4 NAND gates." },
    { q: "A D flip-flop captures input on…", options: ["Any input change", "Clock edge", "Reset only", "Power on"], answer: 1, why: "Edge-triggered flip-flops sample D at the active clock edge." },
    { q: "How many select lines does an 8:1 multiplexer need?", options: ["2", "3", "4", "8"], answer: 1, why: "2³ = 8 inputs." },
    { q: "Binary 1011 in decimal is…", options: ["9", "11", "13", "10"], answer: 1, why: "8 + 0 + 2 + 1 = 11." },
  ],
  Verilog: [
    { q: "Which assignment is preferred inside a clocked always block?", options: ["=", "<=", "assign", "=="], answer: 1, why: "Non-blocking (<=) avoids race conditions in sequential logic." },
    { q: "`always @(*)` typically describes…", options: ["Sequential logic", "Combinational logic", "Testbench delay", "Memory"], answer: 1, why: "A full sensitivity list models combinational logic." },
    { q: "A missing `else` in combinational always block may infer…", options: ["A latch", "A flip-flop", "Nothing", "A MUX only"], answer: 0, why: "Unassigned paths require memory → latch inference." },
  ],
  JavaScript: [
    { q: "`typeof null` returns…", options: ["'null'", "'object'", "'undefined'", "'number'"], answer: 1, why: "A long-standing JS quirk: typeof null is 'object'." },
    { q: "Which declares a block-scoped, non-reassignable binding?", options: ["var", "let", "const", "static"], answer: 2, why: "const is block-scoped and cannot be reassigned." },
    { q: "`[1,2,3].map(x => x*2)` returns…", options: ["[2,4,6]", "12", "undefined", "[1,2,3]"], answer: 0, why: "map returns a new transformed array." },
  ],
  React: [
    { q: "What triggers a component re-render?", options: ["Changing a local variable", "Calling setState with a new value", "console.log", "Editing CSS"], answer: 1, why: "State updates schedule a re-render." },
    { q: "Why do list items need a `key`?", options: ["Styling", "To help React track items between renders", "SEO", "Required by HTML"], answer: 1, why: "Keys let React reconcile list items efficiently and correctly." },
    { q: "useEffect with `[]` dependencies runs…", options: ["Every render", "Once after mount", "Never", "Before render"], answer: 1, why: "An empty array means the effect runs after the first mount only." },
  ],
  "Machine Learning": [
    { q: "High training accuracy but low test accuracy indicates…", options: ["Underfitting", "Overfitting", "Perfect model", "Data leakage always"], answer: 1, why: "The model memorized training data and fails to generalize." },
    { q: "Which metric suits imbalanced binary classification?", options: ["Accuracy", "F1-score", "MSE", "R²"], answer: 1, why: "F1 balances precision and recall regardless of class ratio." },
    { q: "k-means is an example of…", options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Regression"], answer: 1, why: "k-means clusters unlabeled data." },
  ],
  SQL: [
    { q: "Which clause filters grouped results?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1, why: "HAVING filters after GROUP BY; WHERE filters rows before grouping." },
    { q: "LEFT JOIN returns…", options: ["Only matching rows", "All left rows + matches", "All right rows", "Cartesian product"], answer: 1, why: "Unmatched left rows appear with NULLs for right columns." },
    { q: "`COUNT(*)` vs `COUNT(col)`: the latter…", options: ["Is identical", "Ignores NULLs in col", "Counts distinct", "Errors"], answer: 1, why: "COUNT(col) skips NULL values." },
  ],
  "Sensors & Interfacing": [
    { q: "A 12-bit ADC with 3.3V reference has resolution of about…", options: ["0.8 mV", "3.3 mV", "12 mV", "0.1 V"], answer: 0, why: "3.3 V / 4096 ≈ 0.8 mV per step." },
    { q: "I²C uses which two lines?", options: ["MOSI/MISO", "TX/RX", "SDA/SCL", "CS/CLK"], answer: 2, why: "I²C is a two-wire bus: data (SDA) and clock (SCL)." },
    { q: "Why add a pull-up resistor to a button input?", options: ["Increase current", "Define a default HIGH state", "Debounce", "Reduce voltage"], answer: 1, why: "Prevents a floating input when the button is open." },
  ],
};

export const ASSESSABLE = Object.keys(QUESTIONS);
