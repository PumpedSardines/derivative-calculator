import { expect, it } from "@jest/globals";

import { tokenize } from "./lexer";
import { parse } from "./parser";

import { combine } from "./combine";

it.each([
  "3 + 4",
  "3 * (2 + 4)",
  "3 * 2 + 4",
  "(x / 3) ^ (2 - y + e)",
  "sin(2)",
  "x ^ sin(2 - 2) * 3",
  "tan(3) ^ sqrt(2 - 2) * 3",
  "e^2",
  "e^sin(x) * cos(x) - 1 / cos(x) * -sin(x)",
  "-(3 + 2)",
])("combines expression %s", (expression) => {
  const combined = combine(parse(tokenize(expression)));
  return expect(combined).toEqual(expression);
});
