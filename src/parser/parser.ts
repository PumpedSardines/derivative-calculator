import { functionOperators } from "../consts";
import type { LexerToken, Node } from "../types";

type NodeToken = { node: Node } | { token: LexerToken };

/**
 * Parses a token array into a basic node tree.
 * The node tree is not optimized and doesn't have any depends added
 */
export function parse(tokens: LexerToken[]): Node {
  // The idea is to first evaluate the token array in stages where some parts can be evaluated first while the rest are still tokens.
  // We can then have a combined node / token array
  // Example of the process
  // (3 + 4) * 5 -> [{Node}, +, 5]
  // Since addition doesn't care about what it's adding it doesn't matter if the two sides are of different types

  // Evaluate parentheses into nodes
  let tokenNodes = evalParentheses(tokens);
  // Find all function calls and evaluate them, aka [sin {Node / token}] -> [sin({Node})]
  tokenNodes = parseFunctionOperations(tokenNodes);
  // Parse the token array into a node tree
  let nodes = parseTokenNodeArray(structuredClone(tokenNodes));
  // Combine e^x into exp(x)
  nodes = recursiveCombinePowEToExp(nodes);
  return nodes;
}

/**
 * Finds parentheses and evaluates them first and then combines them into a shared node and token array
 */
function evalParentheses(tokens: LexerToken[]): NodeToken[] {
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

/**
 * Recursively combines e^x to exp(x)
 */
function recursiveCombinePowEToExp(node: Node): Node {
  if (
    node.type === "^" &&
    node.args[0].type === "constant" &&
    node.args[0].value === "e"
  ) {
    return recursiveCombinePowEToExp({
      type: "exp",
      arg: node.args[1],
      depends: [],
    });
  }

  if ("args" in node) {
    const args = node.args.map(recursiveCombinePowEToExp) as [Node, Node];
    return {
      type: node.type,
      args,
      depends: [],
    };
  } else if ("arg" in node) {
    const arg = recursiveCombinePowEToExp(node.arg);
    return {
      type: node.type,
      arg,
      depends: [],
    };
  }

  return node;
}

/**
 * Finds all function calls and evaluates them
 */
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

/**
 * Final parsing of the token array into a node tree
 */
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

      if (value) return value as Node;
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
        } as Node;
      }
    }
  }

  throw new Error("Invalid expression");
}
