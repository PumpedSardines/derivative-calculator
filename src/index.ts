import { tokenize } from "./lexer";
import { parse } from "./parser";
import { evaluate } from "./evaluator";
import { derivative } from "./derivative";
import { combine } from "./combine";

const compile = (input: string) => evaluate(parse(tokenize(input)));

[
  "x^2",
  "(x+8)^5",
  "e^(x^3)",
  "e^(3*x) - sin(pi) * x^2",
  "e^(sin(x)) - ln(cos(x))",
].forEach((input) => {
  const node = compile(input);
  const derived = derivative(node);
  const combined = combine(derived);
  console.log(`Derivative of ${input} is ${combined.replace(/\s/g, "")}`);
  console.log();
});
