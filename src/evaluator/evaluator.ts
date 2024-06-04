import type { Node } from "../types";
import { evalAddition } from "./operators/add";
import { evalDivision } from "./operators/div";
import { evalMultiplication } from "./operators/mul";
import { evalSubtraction } from "./operators/sub";

export function evaluate(node: Node): Node {
  let result = recursiveEvaluate(node);
  result = reconstructNegative(result);
  result = generateDepends(result);
  return result;
}

function generateDepends(node: Node): Node {
  if (node.type === "variable") {
    return {
      ...node,
      depends: [node.value],
    };
  }

  if ("args" in node) {
    const args = node.args.map(generateDepends) as [Node, Node];
    return {
      ...node,
      args,
      depends: [...new Set(args.flatMap((arg) => arg.depends))],
    };
  }

  if ("arg" in node) {
    const arg = generateDepends(node.arg);
    return {
      ...node,
      arg,
      depends: structuredClone(arg.depends),
    };
  }

  return node;
}

function reconstructNegative(node: Node): Node {
  if (node.type === "number" && node.parsed < 0) {
    return {
      type: "neg",
      depends: [],
      arg: {
        depends: [],
        type: "number",
        parsed: -node.parsed,
        value: `${-node.parsed}`,
      },
    };
  }

  if ("args" in node) {
    return {
      ...node,
      args: node.args.map(reconstructNegative) as [Node, Node],
    };
  }

  if ("arg" in node) {
    return {
      ...node,
      arg: reconstructNegative(node.arg),
    };
  }

  return node;
}

export function recursiveEvaluate(node: Node): Node {
  switch (node.type) {
    case "+":
      return evalAddition(node);
    case "-":
      return evalSubtraction(node);
    case "*":
      return evalMultiplication(node);
    case "/":
      return evalDivision(node);
    case "^": {
      const b = recursiveEvaluate(node.args[1]);
      if ("parsed" in b && b.parsed === 1) {
        return recursiveEvaluate(node.args[0]);
      }

      return evalArgsOperator(node, (a, b) => {
        const v = Math.pow(a, b);
        if (v === Math.floor(v) && v < 1e3) {
          return v;
        }
        return undefined;
      });
    }
    case "neg": {
      const val = recursiveEvaluate(node.arg);
      if (val.type === "number") {
        return {
          depends: [],
          type: "number",
          parsed: -val.parsed,
          value: `${-val.parsed}`,
        };
      }
      if (val.type === "neg") {
        return val.arg;
      }
      return {
        ...node,
        arg: val,
      };
    }
    case "exp": {
      const arg = recursiveEvaluate(node.arg);
      if (arg.type === "ln") {
        return arg.arg;
      }
      return {
        ...node,
        arg,
      };
    }
    case "ln":
      return {
        ...node,
        arg: recursiveEvaluate(node.arg),
      };
    case "sqrt":
      return evalArgOperator(node, (a) => {
        if (a >= 0) {
          const v = Math.sqrt(a);
          return v === Math.floor(v) ? v : undefined;
        }

        throw new Error("Cannot take square root of negative number");
      });

    case "number":
    case "constant":
    case "variable":
      return node;
  }

  return node;
}

function evalArgOperator(
  node: Node,
  cb: (a: number) => number | undefined,
): Node {
  if (!("arg" in node)) {
    throw new Error("Expected node to have args");
  }

  const value = recursiveEvaluate(node.arg);

  if (value.type === "number") {
    const parsed = cb(value.parsed);
    // Means that the numbers are not valid
    if (parsed == null) return node;
    return {
      depends: [],
      type: "number",
      parsed,
      value: parsed.toString(),
    };
  }

  return node;
}

function evalArgsOperator(
  node: Node,
  cb: (a: number, b: number) => number | undefined,
): Node {
  if (!("args" in node)) {
    throw new Error("Expected node to have args");
  }

  const left = recursiveEvaluate(node.args[0]);
  const right = recursiveEvaluate(node.args[1]);

  if (left.type === "number" && right.type === "number") {
    const parsed = cb(left.parsed, right.parsed);
    // Means that the numbers are not valid
    if (parsed == null) return node;
    return {
      depends: [],
      type: "number",
      parsed,
      value: parsed.toString(),
    };
  }

  return {
    ...node,
    args: [left, right],
  };
}
