import { MulNode, Node } from "../../types";
import { recursiveEvaluate } from "../evaluator";
import { isEqNumber } from "../helpers/isEqNumber";

export function evalMultiplication(node: MulNode): Node {
  const left = recursiveEvaluate(node.args[0]);
  const right = recursiveEvaluate(node.args[1]);

  if (isEqNumber(right, 0) || isEqNumber(left, 0)) {
    return {
      type: "number",
      depends: [],
      parsed: 0,
      value: "0",
    };
  }

  if (isEqNumber(right, 1)) {
    return left;
  }

  if (isEqNumber(left, 1)) {
    return right;
  }

  if (left.type === "/" && right.type === "/") {
    return recursiveEvaluate({
      type: "/",
      depends: [],
      args: [
        {
          type: "*",
          depends: [],
          args: [left.args[0], right.args[0]],
        },
        {
          type: "*",
          depends: [],
          args: [left.args[1], right.args[1]],
        },
      ],
    });
  }

  if (left.type === "/") {
    return recursiveEvaluate({
      type: "/",
      depends: [],
      args: [
        {
          type: "*",
          depends: [],
          args: [left.args[0], right],
        },
        left.args[1],
      ],
    });
  }

  if (right.type === "/") {
    return recursiveEvaluate({
      type: "/",
      depends: [],
      args: [
        {
          type: "*",
          depends: [],
          args: [right.args[0], left],
        },
        right.args[1],
      ],
    });
  }

  if (left.type === "number" && right.type === "number") {
    const v = left.parsed * right.parsed;
    if (Math.floor(v) === v) {
      return {
        type: "number",
        depends: [],
        parsed: left.parsed * right.parsed,
        value: `${left.parsed * right.parsed}`,
      };
    }
  }

  return {
    type: "*",
    depends: [...new Set([...left.depends, ...right.depends])],
    args: [left, right],
  };
}
