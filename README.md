# Derivative Calculator

A simple calculator that can take expressions and calculate the derivative.

Example output of the program:

```sh
Derivative of x^2 is 2*x
Derivative of (x+8)^5 is 5*(x+8)^4
Derivative of e^(x^3) is e^x^3*3*x^2
Derivative of e^(3*x) - sin(pi) * x^2 is e^(3*x)*3-sin(pi)*2*x
Derivative of e^(sin(x)) - ln(cos(x)) is e^sin(x)*cos(x)--sin(x)/cos(x)
```

## How it works

It creates a tree of the expression and then by using the chain and product rule calculates the derivative of every node in the tree recursively
