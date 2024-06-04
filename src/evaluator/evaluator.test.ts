import { expect, it } from "@jest/globals";
import { tokenize } from "../lexer/lexer";
import { parse } from "../parser/parser";
import { evaluate } from "../evaluator/evaluator";

it.each([
  ["1 + 2", { type: "number", depends: [], parsed: 3, value: "3" }],
  ["2 - 1", { type: "number", depends: [], parsed: 1, value: "1" }],
  ["1 * 2", { type: "number", depends: [], parsed: 2, value: "2" }],
  ["6 / 2", { type: "number", depends: [], parsed: 3, value: "3" }],
  ["2 + 3 * 2", { type: "number", depends: [], parsed: 8, value: "8" }],
  ["2 ^ 3", { type: "number", depends: [], parsed: 8, value: "8" }],
])("evaluates %s", (input, output) => {
  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("handles negative", () => {
  const input = "-(1 + -2) * -1";
  const output = {
    type: "neg",
    depends: [],
    arg: {
      type: "number",
      depends: [],
      parsed: 1,
      value: "1",
    },
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("removes e^ln", () => {
  const input = "e^ln(1 + 2)";
  const output = {
    type: "number",
    depends: [],
    parsed: 3,
    value: "3",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("handles sqrt correctly", () => {
  const input = "sqrt(9)";
  const output = {
    type: "number",
    depends: [],
    parsed: 3,
    value: "3",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("removes multiplication with 0", () => {
  const input = "ln(2 - e^40) * 0";
  const output = {
    type: "number",
    depends: [],
    parsed: 0,
    value: "0",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("prunes multiplication with 1", () => {
  const input = "x * 1";
  const output = {
    type: "variable",
    depends: ["x"],
    value: "x",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("prunes addition with 0", () => {
  const input = "x + 0";
  const output = {
    type: "variable",
    depends: ["x"],
    value: "x",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("prunes multiple negation", () => {
  const input = "--x";
  const output = {
    type: "variable",
    depends: ["x"],
    value: "x",
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("combines multiplication with division", () => {
  const input = "1 / x * 3";
  const output = {
    type: "/",
    depends: ["x"],
    args: [
      {
        type: "number",
        depends: [],
        parsed: 3,
        value: "3",
      },
      {
        type: "variable",
        depends: ["x"],
        value: "x",
      },
    ],
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("converts minus negative to addition", () => {
  const input = "x - -2";
  const output = {
    type: "+",
    depends: ["x"],
    args: [
      {
        type: "variable",
        depends: ["x"],
        value: "x",
      },
      {
        type: "number",
        depends: [],
        parsed: 2,
        value: "2",
      },
    ],
  };

  const tokens = tokenize(input);
  const ast = parse(tokens);
  const result = evaluate(ast);

  expect(result).toEqual(output);
});

it("throws sqrt with negative", () => {
  const input = "sqrt(-2)";

  const tokens = tokenize(input);
  const ast = parse(tokens);

  expect(() => evaluate(ast)).toThrow();
});

it("throws when dividing by zero", () => {
  const input = "1 / 0";

  const tokens = tokenize(input);
  const ast = parse(tokens);

  expect(() => evaluate(ast)).toThrow();
});

it("handles dependence", () => {
  const input = "(2 + x) * ((ln(x) - 2) + y)";
  const node = evaluate(parse(tokenize(input)));

  expect(node).toEqual({
    type: "*",
    depends: ["x", "y"],
    args: [
      {
        type: "+",
        depends: ["x"],
        args: [
          {
            type: "number",
            depends: [],
            value: "2",
            parsed: 2,
          },
          {
            type: "variable",
            depends: ["x"],
            value: "x",
          },
        ],
      },
      {
        type: "+",
        depends: ["x", "y"],
        args: [
          {
            type: "-",
            depends: ["x"],
            args: [
              {
                type: "ln",
                depends: ["x"],
                arg: {
                  type: "variable",
                  depends: ["x"],
                  value: "x",
                },
              },
              {
                type: "number",
                depends: [],
                value: "2",
                parsed: 2,
              },
            ],
          },
          {
            type: "variable",
            depends: ["y"],
            value: "y",
          },
        ],
      },
    ],
  });
});

// Added cases that fail after the fact
it.each([
  [
    "(2*(x^(2 - 1))) * 1",
    {
      type: "*",
      depends: ["x"],
      args: [
        {
          type: "number",
          depends: [],
          value: "2",
          parsed: 2,
        },
        {
          type: "variable",
          depends: ["x"],
          value: "x",
        },
      ],
    },
  ],
])(`evaluates %s`, (input, output) => {
  const node = evaluate(parse(tokenize(input)));

  expect(node).toEqual(output);
});
