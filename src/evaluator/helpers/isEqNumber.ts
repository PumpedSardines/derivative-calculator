import type { Node } from "../../types";

/**
 * Checks if a node is equal to a number
 */
export function isEqNumber<T extends number>(
  node: Node,
  number: T,
): node is {
  type: "number";
  parsed: T;
  value: `${T}`;
  depends: string[];
} {
  return node.type === "number" && node.parsed === number;
}
