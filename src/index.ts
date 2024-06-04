import { tokenize } from "./lexer";
import { parse } from "./parser";
import { evaluate } from "./evaluator";
import { derivative } from "./derivative";
import { combine } from "./combine";

const compile = (input: string) => evaluate(parse(tokenize(input)));

["x^2", "e^(x^2 + 2*x)", "(3 * 1 + 0) * x", "(2 + 2 * 3) * x"].forEach(
  (input) => {
    const node = compile(input);
    const derived = derivative(node);
    const combined = combine(derived);
    console.log(`Derivative of ${input} is ${combined.replace(/\s/g, "")}`);
    console.log();
  },
);
