import { functionOperators, type Constant, type Token } from "./lexer";

export type Node =
  | {
      type: "+" | "-" | "*" | "/" | "^";
      args: [Node, Node];
      depends: string[];
    }
  | {
      type:
        | "cos"
        | "sin"
        | "tan"
        | "ln"
        | "sqrt"
        | "exp"
        | "arcsin"
        | "arccos"
        | "arctan"
        | "neg";
      arg: Node;
      depends: string[];
    }
  | {
      type: "variable";
      value: string;
      depends: string[];
    }
  | {
      type: "constant";
      value: Constant;
      depends: string[];
    }
  | {
      type: "number";
      value: string;
      parsed: number;
      depends: string[];
    };

type NodeToken = { node: Node } | { token: Token };

export function parse(tokens: Token[]): Node {
  let tokenNodes = evalParentheses(tokens);
  tokenNodes = parseFunctionOperations(tokenNodes);
  let nodes = parseTokenNodeArray(structuredClone(tokenNodes));
  nodes = recursivePass(nodes);
  return nodes;
}

function evalParentheses(tokens: Token[]): NodeToken[] {
  const tokenNodes: NodeToken[] = structuredClone(tokens).map((t) => ({
    token: t,
  }));

  const parentheses: [number, number][] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;

    if (token.type === "(") {
      let depth = 1;
      let j = i + 1;

      while (depth > 0) {
        if (j >= tokens.length) {
          throw new Error("Unmatched parentheses");
        }

        if (tokens[j]!.type === "(") {
          depth++;
        } else if (tokens[j]!.type === ")") {
          depth--;
        }

        j++;
      }

      parentheses.push([i, j - 1]);
      i = j;
    }
  }

  let lengthMin = 0;
  for (const [start, end] of parentheses) {
    const innerTokens = structuredClone(tokens).slice(start + 1, end);
    const innerNode = parse(innerTokens);
    tokenNodes.splice(start - lengthMin, end - start + 1, {
      node: innerNode,
    });
    lengthMin = lengthMin + end - start;
  }

  return tokenNodes;
}

function recursivePass(node: Node): Node {
  if (
    node.type === "^" &&
    node.args[0].type === "constant" &&
    node.args[0].value === "e"
  ) {
    return recursivePass({
      type: "exp",
      arg: node.args[1],
      depends: [],
    });
  }

  if ("args" in node) {
    const args = node.args.map(recursivePass) as [Node, Node];
    return {
      type: node.type,
      args,
      depends: [],
    };
  } else if ("arg" in node) {
    const arg = recursivePass(node.arg);
    return {
      type: node.type,
      arg,
      depends: [],
    };
  }

  return node;
}

function parseFunctionOperations(nodeTokens: NodeToken[]): NodeToken[] {
  nodeTokens = structuredClone(nodeTokens);

  for (let i = nodeTokens.length - 2; i >= 0; i--) {
    const nodeToken = nodeTokens[i]!;
    if ("node" in nodeToken) {
      continue;
    }
    const token = nodeToken.token;

    if (functionOperators.includes(token.type as any)) {
      const node = parseTokenNodeArray([nodeTokens[i + 1]!]);
      nodeTokens.splice(i, 2, {
        node: {
          type: token.type as (typeof functionOperators)[number],
          arg: node,
          depends: [],
        },
      });

      return parseFunctionOperations(nodeTokens);
    }
  }

  return nodeTokens;
}

function parseTokenNodeArray(nodeTokens: NodeToken[]): Node {
  nodeTokens = structuredClone(nodeTokens);

  if (nodeTokens.length === 0) {
    throw new Error("Invalid expression");
  }

  if (nodeTokens.length === 1) {
    const nodeToken = nodeTokens[0]!;

    if ("node" in nodeToken) {
      return nodeToken.node;
    } else {
      const token = nodeToken.token;

      if (token.type === "number") {
        return {
          type: "number",
          value: token.value,
          parsed: token.parsed,
          depends: [],
        };
      } else if (token.type === "variable") {
        return {
          type: "variable",
          value: token.value,
          depends: [],
        };
      } else if (token.type === "constant") {
        return {
          type: "constant",
          value: token.value,
          depends: [],
        };
      }
    }
  }

  for (const operatorPairs of [
    ["+", "-"],
    ["*", "/"],
    ["neg"],
    ["^"],
  ] as const) {
    if (operatorPairs[0] === "neg") {
      const value = (() => {
        const nodeToken = nodeTokens[0]!;

        if ("node" in nodeToken) {
          return;
        }

        const token = nodeToken.token;

        if (token.type === "-") {
          const node = parseTokenNodeArray(nodeTokens.slice(1));
          return {
            type: "neg",
            arg: node,
            depends: [] as string[],
          } as const;
        }

        return;
      })();

      if (value) return value;
    }

    for (let i = nodeTokens.length - 1; i >= 1; i--) {
      const nodeToken = nodeTokens[i]!;

      if ("node" in nodeToken) {
        continue;
      }

      const token = nodeToken.token;

      if (token.type === "-") {
        const prevNodeToken = nodeTokens[i - 1]!;

        if ("token" in prevNodeToken) {
          const prevToken = prevNodeToken.token;

          if (!["constant", "variable", "number"].includes(prevToken.type)) {
            continue;
          }
        }
      }

      if (token.type === operatorPairs[0] || token.type === operatorPairs[1]) {
        return {
          type: token.type,
          depends: [],
          args: [
            parseTokenNodeArray(nodeTokens.slice(0, i)),
            parseTokenNodeArray(nodeTokens.slice(i + 1)),
          ],
        };
      }
    }
  }

  throw new Error("Invalid expression");
}
