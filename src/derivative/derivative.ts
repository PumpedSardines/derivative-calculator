import { evaluate } from "../evaluator/evaluator";
import { Node } from "../types";

type DerivationOptions = {
  variable: string;
};

export function derivative(node: Node): Node {
  let result = recursiveDerivative(node, { variable: "x" });
  result = evaluate(result);
  return result;
}

function recursiveDerivative(node: Node, options: DerivationOptions): Node {
  const variable = options.variable;

  if (!node.depends.includes(variable)) {
    return { depends: [], type: "number", value: "0", parsed: 0 };
  }

  if (node.type === "variable") {
    return { depends: [], type: "number", value: "1", parsed: 1 };
  }

  if (node.type === "neg") {
    return {
      ...node,
      arg: recursiveDerivative(node.arg, options),
    };
  }

  if (node.type === "+") {
    return {
      ...node,
      args: node.args.map((arg) => recursiveDerivative(arg, options)) as [
        Node,
        Node,
      ],
    };
  }

  if (node.type === "-") {
    return {
      ...node,
      args: node.args.map((arg) => recursiveDerivative(arg, options)) as [
        Node,
        Node,
      ],
    };
  }

  if (node.type === "*") {
    const [a, b] = node.args;

    return evaluate({
      type: "+",
      depends: [],
      args: [
        {
          type: "*",
          depends: [],
          args: [recursiveDerivative(a, options), b],
        },
        {
          type: "*",
          depends: [],
          args: [a, recursiveDerivative(b, options)],
        },
      ],
    });
  }

  if (node.type === "^") {
    if (
      node.args[0].depends.includes(variable) &&
      !node.args[1].depends.includes(variable)
    ) {
      return evalPowerRule(node, options);
    }
  }

  if (node.type === "exp") {
    return {
      type: "*",
      depends: [],
      args: [
        {
          type: "exp",
          depends: [],
          arg: node.arg,
        },
        recursiveDerivative(node.arg, options),
      ],
    };
  }

  if (node.type === "ln") {
    return {
      type: "*",
      depends: [],
      args: [
        {
          type: "/",
          depends: [],
          args: [
            {
              type: "number",
              depends: [],
              value: "1",
              parsed: 1,
            },
            node.arg,
          ],
        },
        recursiveDerivative(node.arg, options),
      ],
    };
  }

  if (node.type === "sin") {
    return {
      type: "*",
      depends: [],
      args: [
        {
          type: "cos",
          depends: [],
          arg: node.arg,
        },
        recursiveDerivative(node.arg, options),
      ],
    };
  }

  if (node.type === "cos") {
    return {
      type: "*",
      depends: [],
      args: [
        {
          type: "neg",
          depends: [],
          arg: {
            type: "sin",
            depends: [],
            arg: node.arg,
          },
        },
        recursiveDerivative(node.arg, options),
      ],
    };
  }

  throw new Error("Not implemented");
}

function evalPowerRule(node: Node, options: DerivationOptions): Node {
  if (node.type !== "^") {
    throw new Error("Invalid node type");
  }

  const [a, b] = node.args;

  const final = evaluate({
    type: "*",
    depends: [],
    args: [
      {
        type: "*",
        depends: [],
        args: [
          b,
          {
            type: "^",
            depends: [],
            args: [
              a,
              {
                depends: [],
                type: "-",
                args: [
                  b,
                  {
                    depends: [],
                    type: "number",
                    value: "1",
                    parsed: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
      recursiveDerivative(a, options),
    ],
  });

  return final;
}
