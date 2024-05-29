import { expect, it } from "@jest/globals";
import { tokenize } from "./lexer";

it("tokenizes operators", () => {
  const input = "+-/()";
  const output = [
    { type: "+" },
    { type: "-" },
    { type: "/" },
    { type: "(" },
    { type: ")" },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenizes operators with spaces", () => {
  const input = "+ - \n  \t /()";
  const output = [
    { type: "+" },
    { type: "-" },
    { type: "/" },
    { type: "(" },
    { type: ")" },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenizes operators, variables and constants", () => {
  const input = "x+y^pi";
  const output = [
    { type: "variable", value: "x" },
    { type: "+" },
    { type: "variable", value: "y" },
    { type: "^" },
    { type: "constant", value: "pi" },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenizes specific variable names as operators", () => {
  const input = "cos+sin";
  const output = [{ type: "cos" }, { type: "+" }, { type: "sin" }];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize variables with spaces", () => {
  const input = "x y";
  const output = [
    { type: "variable", value: "x" },
    { type: "variable", value: "y" },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize number", () => {
  const input = "1";
  const output = [{ type: "number", value: "1", parsed: 1 }];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize number multiple numbers", () => {
  const input = "1 + 10 / 20 30";
  const output = [
    { type: "number", value: "1", parsed: 1 },
    { type: "+" },
    { type: "number", value: "10", parsed: 10 },
    { type: "/" },
    { type: "number", value: "20", parsed: 20 },
    { type: "number", value: "30", parsed: 30 },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize floats", () => {
  const input = "1.6-3.7";
  const output = [
    { type: "number", value: "1.6", parsed: 1.6 },
    { type: "-" },
    { type: "number", value: "3.7", parsed: 3.7 },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize exp notation", () => {
  const input = "1e2+3e-4-3.5e2";
  const output = [
    { type: "number", value: "1e2", parsed: 100 },
    { type: "+" },
    { type: "number", value: "3e-4", parsed: 0.0003 },
    { type: "-" },
    { type: "number", value: "3.5e2", parsed: 350 },
  ];

  expect(tokenize(input)).toEqual(output);
});

it.each(["1.", ".1", "1.1.", "1.1.1", "1e", "1e-", "1.12e50.3", "10e30e"])(
  "throws on incorrect float %s",
  (v) => {
    expect(() => tokenize(v)).toThrow();
  },
);

it("tokenize numbers and operators with variables no spaces", () => {
  const input = "1+10.5e2x/y20";
  const output = [
    { type: "number", value: "1", parsed: 1 },
    { type: "+" },
    { type: "number", value: "10.5e2", parsed: 1050 },
    { type: "variable", value: "x" },
    { type: "/" },
    { type: "variable", value: "y" },
    { type: "number", value: "20", parsed: 20 },
  ];

  expect(tokenize(input)).toEqual(output);
});

it("tokenize realistic expression", () => {
  const input = "1 + 3 - e^(x + 1.5e2) * 2";
  const output = [
    { type: "number", value: "1", parsed: 1 },
    { type: "+" },
    { type: "number", value: "3", parsed: 3 },
    { type: "-" },
    { type: "constant", value: "e" },
    { type: "^" },
    { type: "(" },
    { type: "variable", value: "x" },
    { type: "+" },
    { type: "number", value: "1.5e2", parsed: 150 },
    { type: ")" },
    { type: "*" },
    { type: "number", value: "2", parsed: 2 },
  ];

  expect(tokenize(input)).toEqual(output);
});
