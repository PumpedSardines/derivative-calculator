import { expect, it } from "@jest/globals";
import { evalDivision } from "./div";

it("divides correctly", () => {
  const output = evalDivision({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "4", parsed: 4 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });

  expect(output).toMatchObject({
    type: "number",
    depends: [],
    parsed: 2,
    value: "2",
  });
});

it("ignores dividing when result is a fraction", () => {
  const output = evalDivision({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });

  expect(output).toMatchObject({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });
});

it("throws when dividing by zero", () => {
  const output = () =>
    evalDivision({
      type: "/",
      depends: [],
      args: [
        { type: "number", depends: [], value: "4", parsed: 3 },
        { type: "number", depends: [], value: "0", parsed: 0 },
      ],
    });

  expect(output).toThrow();
});

it("prunes zeros", () => {
  const output = evalDivision({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "0", parsed: 0 },
      { type: "variable", depends: [], value: "x" },
    ],
  });

  expect(output).toMatchObject({
    type: "number",
    depends: [],
    parsed: 0,
    value: "0",
  });
});

it("combines negtaion", () => {
  const output1 = evalDivision({
    type: "/",
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
      type: "/",
      depends: [],
      args: [
        { type: "number", depends: [], value: "4", parsed: 4 },
        { type: "variable", depends: [], value: "x" },
      ],
    },
  });

  const output2 = evalDivision({
    type: "/",
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
      type: "/",
      depends: [],
      args: [
        { type: "number", depends: [], value: "4", parsed: 4 },
        { type: "variable", depends: [], value: "x" },
      ],
    },
  });

  const output3 = evalDivision({
    type: "/",
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
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "4", parsed: 4 },
      { type: "variable", depends: [], value: "x" },
    ],
  });
});

it("ignores dividing when result is a fraction", () => {
  const output = evalDivision({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });

  expect(output).toMatchObject({
    type: "/",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "2", parsed: 2 },
    ],
  });
});
