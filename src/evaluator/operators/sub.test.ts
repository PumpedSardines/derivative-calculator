import { expect, it } from "@jest/globals";
import { evalSubtraction } from "./sub";

it("subs correctly", () => {
  const output = evalSubtraction({
    type: "-",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "4", parsed: 4 },
    ],
  });

  expect(output).toMatchObject({
    type: "number",
    depends: [],
    parsed: -1,
    value: "-1",
  });
});

it("prunes zeros to the right", () => {
  const output = evalSubtraction({
    type: "-",
    depends: [],
    args: [
      { type: "variable", depends: [], value: "x" },
      { type: "number", depends: [], value: "0", parsed: 0 },
    ],
  });

  expect(output).toMatchObject({
    type: "variable",
    depends: [],
    value: "x",
  });
});

it("prunes zeros to the left", () => {
  const output = evalSubtraction({
    type: "-",
    depends: [],
    args: [
      { type: "number", depends: [], value: "0", parsed: 0 },
      { type: "variable", depends: [], value: "x" },
    ],
  });

  expect(output).toMatchObject({
    type: "neg",
    depends: [],
    arg: {
      type: "variable",
      depends: [],
      value: "x",
    },
  });
});
