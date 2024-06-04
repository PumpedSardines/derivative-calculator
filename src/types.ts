import { constants, functionOperators, elementaryOperators } from "./consts";

export type Operator =
  | (typeof elementaryOperators)[number]
  | (typeof functionOperators)[number]
  | "exp"
  | "neg";
export type Constant = (typeof constants)[number];

export type LexerToken =
  | { type: Operator }
  | { type: "(" | ")" }
  | {
      type: "variable";
      value: string;
    }
  | {
      type: "constant";
      value: Constant;
    }
  | { type: "number"; value: string; parsed: number };

type ElementaryOperatorNode<T extends Operator> = {
  type: T;
  depends: string[];
  args: [Node, Node];
};

type FunctionNode<T extends Operator> = {
  type: T;
  depends: string[];
  arg: Node;
};
export type CosNode = FunctionNode<"cos">;
export type SinNode = FunctionNode<"sin">;
export type TanNode = FunctionNode<"tan">;
export type LnNode = FunctionNode<"ln">;
export type SqrtNode = FunctionNode<"sqrt">;
export type ArcsinNode = FunctionNode<"arcsin">;
export type ArccosNode = FunctionNode<"arccos">;
export type ArctanNode = FunctionNode<"arctan">;
export type ExpNode = FunctionNode<"exp">;
export type NegNode = FunctionNode<"neg">;

export type PlusNode = ElementaryOperatorNode<"+">;
export type MinusNode = ElementaryOperatorNode<"-">;
export type MulNode = ElementaryOperatorNode<"*">;
export type DivNode = ElementaryOperatorNode<"/">;
export type PowNode = ElementaryOperatorNode<"^">;

export type NumberNode = {
  type: "number";
  depends: string[];
  value: string;
  parsed: number;
};
export type VariableNode = {
  type: "variable";
  depends: string[];
  value: string;
};
export type ConstantNode = {
  type: "constant";
  depends: string[];
  value: Constant;
};

export type Node =
  | CosNode
  | SinNode
  | TanNode
  | LnNode
  | SqrtNode
  | ArcsinNode
  | ArccosNode
  | ArctanNode
  | ExpNode
  | NegNode
  | PlusNode
  | MinusNode
  | MulNode
  | DivNode
  | PowNode
  | NumberNode
  | VariableNode
  | ConstantNode;
