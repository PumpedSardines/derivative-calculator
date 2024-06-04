import type { Node } from "../types";

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

function recursiveEvaluate(node: Node): Node {
  switch (node.type) {
    case "+": {
      const left = recursiveEvaluate(node.args[0]);
      const right = recursiveEvaluate(node.args[1]);

      if (nodeNumberEq(left, 0)) {
        return right;
      }
      if (nodeNumberEq(right, 0)) {
        return left;
      }

      return evalArgsOperator(node, (a, b) => a + b);
    }
    case "-": {
      const left = recursiveEvaluate(node.args[0]);
      const right = recursiveEvaluate(node.args[1]);

      if (right.type === "neg") {
        return evaluate({
          type: "+",
          depends: [],
          args: [left, right.arg],
        });
      }

      if (right.type === "number" && right.parsed < 0) {
        return evaluate({
          type: "+",
          depends: [],
          args: [
            left,
            {
              type: "neg",
              depends: [],
              arg: right,
            },
          ],
        });
      }

      return evalArgsOperator(node, (a, b) => a - b);
    }
    case "*": {
      const left = recursiveEvaluate(node.args[0]);
      const right = recursiveEvaluate(node.args[1]);

      if (nodeNumberEq(left, 0) || nodeNumberEq(right, 0)) {
        return {
          depends: [],
          type: "number",
          parsed: 0,
          value: "0",
        };
      }

      if (nodeNumberEq(left, 1)) {
        return right;
      }
      if (nodeNumberEq(right, 1)) {
        return left;
      }

      if (left.type === "/") {
        return evaluate({
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
        return evaluate({
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

      return evalArgsOperator(node, (a, b) => a * b);
    }
    case "/":
      return evalArgsOperator(node, (a, b) => {
        if (b === 0) throw new Error("Cannot divide by zero");
        const v = a / b;
        return v === Math.floor(v) ? v : undefined;
      });
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

function nodeNumberEq<T extends number>(
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
