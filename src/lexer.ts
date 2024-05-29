export const elementaryOperators = ["^", "*", "/", "+", "-"] as const;
export const functionOperators = [
  "sin",
  "cos",
  "tan",
  "ln",
  "arcsin",
  "arccos",
  "arctan",
  "sqrt",
] as const;
const constants = ["pi", "e"] as const;

export type Operator =
  | (typeof elementaryOperators)[number]
  | (typeof functionOperators)[number];
export type Constant = (typeof constants)[number];

type ParsingType = "none" | "operator" | "number" | "variable";

export type Token =
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

/**
 * Tokenizes the input string into an array of mathematical tokens.
 *
 * @param input The input string to tokenize.
 * @returns An array of tokens.
 * @throws If the input contains invalid characters.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  let parsingType: ParsingType = "none";
  let currentValue = "";
  let wasLastEInNumber = false;

  const chars = input.split("");
  let index = 0;

  const pushVariable = (value: string) => {
    if (functionOperators.includes(value as any)) {
      tokens.push({ type: value as Operator });
    } else if (constants.includes(value as Constant)) {
      tokens.push({ type: "constant", value: value as Constant });
    } else {
      tokens.push({ type: "variable", value });
    }
  };

  const pushNumber = (value: string) => {
    if (/^\d+(\.\d+)?(e-?\d+)?$/.test(value) === false) {
      throw new Error(`Invalid number: ${value}`);
    }

    tokens.push({ type: "number", value, parsed: Number(value) });
  };

  letterLoop: while (index < chars.length) {
    const char = chars[index]!;

    if ([" ", "\n", "\t"].includes(char)) {
      index++;

      if (parsingType == "variable") {
        pushVariable(currentValue);
        parsingType = "none";
        currentValue = "";
      }

      if (parsingType == "number") {
        pushNumber(currentValue);
        parsingType = "none";
        currentValue = "";
      }

      continue;
    }

    if (parsingType == "none") {
      parsingType = getParsingTypeFromValue(char);

      switch (parsingType) {
        case "variable":
        case "number":
          currentValue = char;
          index++;
          break;
        case "operator":
          tokens.push({ type: char as Operator });
          parsingType = "none";
          index++;
          break;
      }

      continue letterLoop;
    }

    if (parsingType == "variable") {
      if (getParsingTypeFromValue(char) == "variable") {
        currentValue += char;
      } else {
        pushVariable(currentValue);
        parsingType = "none";
        currentValue = "";
        continue letterLoop;
      }
    }

    if (parsingType == "number") {
      if (char === "-" && wasLastEInNumber) {
        wasLastEInNumber = false;
        currentValue += char;
      } else if (getParsingTypeFromValue(char) == "number" || char === "e") {
        if (char === "e") {
          wasLastEInNumber = true;
        } else {
          wasLastEInNumber = false;
        }
        currentValue += char;
      } else {
        pushNumber(currentValue);
        parsingType = "none";
        currentValue = "";
        wasLastEInNumber = false;
        continue letterLoop;
      }
    }

    index++;
  }

  if (parsingType == "variable") {
    pushVariable(currentValue);
  }

  if (parsingType == "number") {
    pushNumber(currentValue);
  }

  return tokens;
}

function getParsingTypeFromValue(value: string): ParsingType {
  if (!isNaN(Number(value)) || value == ".") {
    return "number";
  } else if (
    elementaryOperators.includes(value as any) ||
    value == "(" ||
    value == ")"
  ) {
    return "operator";
  } else if (value.match(/[a-zA-Z]/)) {
    return "variable";
  }

  throw new Error(`Invalid character: ${value}`);
}
