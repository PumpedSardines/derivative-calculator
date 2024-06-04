import { expect, it } from "@jest/globals";
import { evalAddition } from "./add";

it("adds correctly", () => {
  const output = evalAddition({
    type: "+",
    depends: [],
    args: [
      { type: "number", depends: [], value: "3", parsed: 3 },
      { type: "number", depends: [], value: "4", parsed: 4 },
    ],
  });

  expect(output).toMatchObject({
    type: "number",
    depends: [],
    parsed: 7,
    value: "7",
  });
});

it("prunes zeros", () => {
  const output = evalAddition({
    type: "+",
    depends: [],
    args: [
      { type: "number", depends: [], value: "0", parsed: 0 },
      { type: "variable", depends: [], value: "x" },
    ],
  });

  expect(output).toMatchObject({
    type: "variable",
    depends: [],
    value: "x",
  });
});
