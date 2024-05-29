import { expect, it } from "@jest/globals";
import { tokenize } from "./lexer";
import { parse } from "./parser";

it("parses operators", () => {
  const input = "3+4";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "+",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "4", parsed: 4 },
    ],
  });
});

it("parses operators order of operations", () => {
  const input = "3^e*2+x*pi";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "+",
    depends: [],
    args: [
      {
        type: "*",
        depends: [],
        args: [
          {
            type: "^",
            depends: [],
            args: [
              { type: "number", depends: [], value: "3", parsed: 3 },
              { type: "constant", depends: [], value: "e" },
            ],
          },
          { type: "number", depends: [], value: "2", parsed: 2 },
        ],
      },
      {
        type: "*",
        depends: [],
        args: [
          { type: "variable", depends: [], value: "x" },
          { type: "constant", depends: [], value: "pi" },
        ],
      },
    ],
  });
});

it("parses parentheses first", () => {
  const input = "(3 + 4) * 5";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "*",
    depends: [],
    args: [
      {
        type: "+",
        depends: [],
        args: [
          { type: "number", depends: [], value: "3", parsed: 3 },
          { type: "number", depends: [], value: "4", parsed: 4 },
        ],
      },
      { type: "number", depends: [], value: "5", parsed: 5 },
    ],
  });
});

it("parses multiple parentheses", () => {
  const input = "(3 + 4) * (3 + 6)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "*",
    depends: [],
    args: [
      {
        type: "+",
        depends: [],
        args: [
          { type: "number", value: "3", parsed: 3, depends: [] },
          { type: "number", value: "4", depends: [], parsed: 4 },
        ],
      },
      {
        type: "+",
        depends: [],
        args: [
          { type: "number", depends: [], value: "3", parsed: 3 },
          { type: "number", value: "6", depends: [], parsed: 6 },
        ],
      },
    ],
  });
});

it("parses nested parentheses", () => {
  const input = "(3 * (2 + 2)) ^ (3 + 6)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "^",
    depends: [],
    args: [
      {
        type: "*",
        depends: [],
        args: [
          { type: "number", value: "3", depends: [], parsed: 3 },
          {
            type: "+",
            depends: [],
            args: [
              { type: "number", depends: [], value: "2", parsed: 2 },
              { type: "number", depends: [], value: "2", parsed: 2 },
            ],
          },
        ],
      },
      {
        type: "+",
        depends: [],
        args: [
          { type: "number", depends: [], value: "3", parsed: 3 },
          { type: "number", depends: [], value: "6", parsed: 6 },
        ],
      },
    ],
  });
});

it("parses functional operators", () => {
  const input = "ln 2";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "ln",
    depends: [],
    arg: {
      type: "number",
      depends: [],
      value: "2",
      parsed: 2,
    },
  });
});

it("parses multiple functional operators", () => {
  const input = "sin ln(2 + 2)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "sin",
    depends: [],
    arg: {
      type: "ln",
      depends: [],
      arg: {
        type: "+",
        depends: [],
        args: [
          { depends: [], type: "number", value: "2", parsed: 2 },
          { depends: [], type: "number", value: "2", parsed: 2 },
        ],
      },
    },
  });
});

it("parses negation correctly", () => {
  const input = "-2 - -2";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "-",
    depends: [],
    args: [
      {
        depends: [],
        type: "neg",
        arg: { depends: [], type: "number", value: "2", parsed: 2 },
      },
      {
        depends: [],
        type: "neg",
        arg: {
          depends: [],
          type: "number",
          value: "2",
          parsed: 2,
        },
      },
    ],
  });
});

it("parses negation correctly with multiple parentheses", () => {
  const input = "-ln(-2)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "neg",
    depends: [],
    arg: {
      depends: [],
      type: "ln",
      arg: {
        depends: [],
        type: "neg",
        arg: {
          depends: [],
          type: "number",
          value: "2",
          parsed: 2,
        },
      },
    },
  });
});

it("parses negation correctly with operands", () => {
  const input = "-x^2";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "neg",
    depends: [],
    arg: {
      type: "^",
      depends: [],
      args: [
        {
          depends: [],
          type: "variable",
          value: "x",
        },
        {
          depends: [],
          type: "number",
          value: "2",
          parsed: 2,
        },
      ],
    },
  });
});

it("combines e^ into exp", () => {
  const input = "e^(e^2)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "exp",
    depends: [],
    arg: {
      type: "exp",
      depends: [],
      arg: {
        depends: [],
        type: "number",
        value: "2",
        parsed: 2,
      },
    },
  });
});

it("combines e^ into exp more complex", () => {
  const input = "-e^((sin 2)^2)";
  const node = parse(tokenize(input));

  expect(node).toEqual({
    type: "neg",
    depends: [],
    arg: {
      type: "exp",
      depends: [],
      arg: {
        type: "^",
        depends: [],
        args: [
          {
            type: "sin",
            depends: [],
            arg: {
              depends: [],
              type: "number",
              value: "2",
              parsed: 2,
            },
          },
          {
            depends: [],
            type: "number",
            value: "2",
            parsed: 2,
          },
        ],
      },
    },
  });
});

// Added cases that fail after the fact
it.each(["-(1 + -2) * -1", "1 / x * 3"])(`parses %s`, (input) => {
  const node = parse(tokenize(input));

  expect(node).toMatchSnapshot();
});
