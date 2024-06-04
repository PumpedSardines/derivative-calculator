import { expect, it } from "@jest/globals";
import { tokenize } from "../lexer/lexer";
import { parse } from "../parser/parser";
import { evaluate } from "../evaluator/evaluator";
import { derivative } from "./derivative";

const compile = (input: string) => evaluate(parse(tokenize(input)));

it.each(["x^2", "(x + 8)^5", "x^(sin(2) - pi)"])(
  "derives power rule %s",
  (input) => {
    const result = derivative(compile(input));
    expect(result).toMatchSnapshot();
  },
);

it.each(["e^(2 * x)"])("derives exp %s", (input) => {
  const result = derivative(compile(input));
  expect(result).toMatchSnapshot();
});

it.each(["ln(x)"])("derives logarithms %s", (input) => {
  const result = derivative(compile(input));
  expect(result).toMatchSnapshot();
});

it.each(["sin(x)", "-cos(x)", "ln(sin(x))"])("derives trig %s", (input) => {
  const result = derivative(compile(input));
  expect(result).toMatchSnapshot();
});
