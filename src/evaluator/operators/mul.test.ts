import { expect, it } from "@jest/globals";
import { evalMultiplication } from "./mul";

it("multiplies correctly", () => {
  const output = evalMultiplication({
    type: "*",
    depends: [],
    args: [
      { type: "number", depends: [], value: "4", parsed: 4 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });

  expect(output).toMatchObject({
    type: "number",
    depends: [],
    parsed: 8,
    value: "8",
  });
});

it("combines division", () => {
  const output = evalMultiplication({
    type: "*",
    depends: [],
    args: [
      {
        type: "/",
        depends: [],
        args: [
          { type: "number", depends: [], value: "7", parsed: 7 },
          { type: "number", depends: [], value: "3", parsed: 3 },
        ],
      },
      {
        type: "/",
        depends: [],
        args: [
          { type: "number", depends: [], value: "3", parsed: 3 },
          { type: "number", depends: [], value: "2", parsed: 2 },
        ],
      },
    ],
  });

  expect(output).toMatchObject({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "21", parsed: 21 },
      { type: "number", depends: [], value: "6", parsed: 6 },
    ],
  });
});

it("combines negtaion", () => {
  const output1 = evalMultiplication({
    type: "*",
    depends: [],
    args: [
      {
        type: "neg",
        depends: [],
        arg: { type: "number", depends: [], value: "4", parsed: 4 },
      },
      { type: "variable", depends: [], value: "x" },
    ],
  });

  expect(output1).toMatchObject({
    type: "neg",
    depends: [],
    arg: {
      type: "*",
      depends: [],
      args: [
        { type: "number", depends: [], value: "4", parsed: 4 },
        { type: "variable", depends: [], value: "x" },
      ],
    },
  });

  const output2 = evalMultiplication({
    type: "*",
    depends: [],
    args: [
      { type: "number", depends: [], value: "4", parsed: 4 },
      {
        type: "neg",
        depends: [],
        arg: { type: "variable", depends: [], value: "x" },
      },
    ],
  });

  expect(output2).toMatchObject({
    type: "neg",
    depends: [],
    arg: {
      type: "*",
      depends: [],
      args: [
        { type: "number", depends: [], value: "4", parsed: 4 },
        { type: "variable", depends: [], value: "x" },
      ],
    },
  });

  const output3 = evalMultiplication({
    type: "*",
    depends: [],
    args: [
      {
        type: "neg",
        depends: [],
        arg: { type: "number", depends: [], value: "4", parsed: 4 },
      },
      {
        type: "neg",
        depends: [],
        arg: { type: "variable", depends: [], value: "x" },
      },
    ],
  });

  expect(output3).toMatchObject({
    type: "*",
    depends: [],
    args: [
      { type: "number", depends: [], value: "4", parsed: 4 },
      { type: "variable", depends: [], value: "x" },
    ],
  });
});
