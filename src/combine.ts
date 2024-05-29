import { elementaryOperators, functionOperators } from "./lexer";
import { Node } from "./parser";

export function combine(node: Node): string {
  return recursiveCombine(node, null);
}

function recursiveCombine(node: Node, previous: Node | null): string {
  if (node.type === "number") {
    return node.value;
  }

  if (node.type === "variable") {
    return node.value;
  }

  if (node.type === "constant") {
    return node.value;
  }

  if (elementaryOperators.includes(node.type as any)) {
    return handelElementaryOperator(node, previous, node.type);
  }

  if (node.type === "exp") {
    return `e^${recursiveCombine(node.arg, node)}`;
  }

  if (functionOperators.includes(node.type as any)) {
    if (!("arg" in node)) {
      throw new Error("Expected node to have arg");
    }

    return `${node.type}(${recursiveCombine(node.arg, null)})`;
  }

  if (node.type === "neg") {
    return `-${recursiveCombine(node.arg, node)}`;
  }

  throw new Error("Unsupported node type");
}

function handelElementaryOperator(
  node: Node,
  previous: Node | null,
  operator: string,
): string {
  if (!("args" in node)) {
    throw new Error("Expected node to have args");
  }

  const expression = node.args
    .map((arg) => recursiveCombine(arg, node))
    .join(` ${operator} `);

  if (previous && compareOperators(previous.type, operator) > 0) {
    return `(${expression})`;
  }

  return expression;
}

function compareOperators(a: string, b: string): number {
  const precedence = {
    number: 0,
    variable: 0,
    constant: 0,
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    neg: 2,
    "^": 3,
    exp: 3,
  } as const;

  const left = a as keyof typeof precedence;
  const right = b as keyof typeof precedence;

  if (!(left in precedence) || !(right in precedence)) {
    throw new Error("Unsupported operator");
  }

  return precedence[left] - precedence[right];
}
