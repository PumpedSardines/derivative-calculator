import { SubNode, Node } from "../../types";
import { recursiveEvaluate } from "../evaluator";
import { isEqNumber } from "../helpers/isEqNumber";
import { ltZero } from "../helpers/ltZero";

export function evalSubtraction(node: SubNode): Node {
  const left = recursiveEvaluate(node.args[0]);
  const right = recursiveEvaluate(node.args[1]);

  if (isEqNumber(left, 0)) {
    return recursiveEvaluate({
      type: "neg",
      depends: [],
      arg: right,
    });
  }

  if (isEqNumber(right, 0)) {
    return left;
  }

  if (ltZero(right)) {
    return recursiveEvaluate({
      type: "+",
      depends: [],
      args: [left, { type: "neg", depends: [], arg: right }],
    });
  }

  if (left.type === "number" && right.type === "number") {
    return {
      type: "number",
      depends: [],
      parsed: left.parsed - right.parsed,
      value: `${left.parsed - right.parsed}`,
    };
  }

  return {
    type: "-",
    depends: [...new Set([...left.depends, ...right.depends])],
    args: [left, right],
  };
}
