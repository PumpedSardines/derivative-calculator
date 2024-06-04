import type { Node } from "../../types";

export function ltZero(node: Node): boolean {
  if (node.type === "number" && node.parsed < 0) {
    return true;
  }

  return node.type === "neg";
}
