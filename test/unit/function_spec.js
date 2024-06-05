/* Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PostScriptLexer, PostScriptParser } from "../../src/core/ps_parser.js";
import { PostScriptEvaluator } from "../../src/core/function.js";
import { StringStream } from "../../src/core/stream.js";

describe("function", function () {
  describe("PostScriptParser", function () {
    function parse(program) {
      const stream = new StringStream(program);
      const parser = new PostScriptParser(new PostScriptLexer(stream));
      return parser.parse();
    }
    it("parses empty programs", function () {
      const output = parse("{}");
      expect(output.length).toEqual(0);
    });
    it("parses positive numbers", function () {
      const number = 999;
      const program = parse("{ " + number + " }");
      const expectedProgram = [number];
      expect(program).toEqual(expectedProgram);
    });
    it("parses negative numbers", function () {
      const number = -999;
      const program = parse("{ " + number + " }");
      const expectedProgram = [number];
      expect(program).toEqual(expectedProgram);
    });
    it("parses negative floats", function () {
      const number = 3.3;
      const program = parse("{ " + number + " }");
      const expectedProgram = [number];
      expect(program).toEqual(expectedProgram);
    });
    it("parses operators", function () {
      const program = parse("{ sub }");
      const expectedProgram = ["sub"];
      expect(program).toEqual(expectedProgram);
    });
    it("parses if statements", function () {
      const program = parse("{ { 99 } if }");
      const expectedProgram = [3, "jz", 99];
      expect(program).toEqual(expectedProgram);
    });
    it("parses ifelse statements", function () {
      const program = parse("{ { 99 } { 44 } ifelse }");
      const expectedProgram = [5, "jz", 99, 6, "j", 44];
      expect(program).toEqual(expectedProgram);
    });
    it("handles missing brackets", function () {
      expect(function () {
        parse("{");
      }).toThrow(new Error("Unexpected symbol: found undefined expected 1."));
    });
    it("handles junk after the end", function () {
      const number = 3.3;
      const program = parse("{ " + number + " }#");
      const expectedProgram = [number];
      expect(program).toEqual(expectedProgram);
    });
  });

  describe("PostScriptEvaluator", function () {
    function evaluate(program) {
      const stream = new StringStream(program);
      const parser = new PostScriptParser(new PostScriptLexer(stream));
      const code = parser.parse();
      const evaluator = new PostScriptEvaluator(code);
      const output = evaluator.execute();
      return output;
    }

    it("pushes stack", function () {
      const stack = evaluate("{ 99 }");
      const expectedStack = [99];
      expect(stack).toEqual(expectedStack);
    });
    it("handles if with true", function () {
      const stack = evaluate("{ 1 {99} if }");
      const expectedStack = [99];
      expect(stack).toEqual(expectedStack);
    });
    it("handles if with false", function () {
      const stack = evaluate("{ 0 {99} if }");
      const expectedStack = [];
      expect(stack).toEqual(expectedStack);
    });
    it("handles ifelse with true", function () {
      const stack = evaluate("{ 1 {99} {77} ifelse }");
      const expectedStack = [99];
      expect(stack).toEqual(expectedStack);
    });
    it("handles ifelse with false", function () {
      const stack = evaluate("{ 0 {99} {77} ifelse }");
      const expectedStack = [77];
      expect(stack).toEqual(expectedStack);
    });
    it("handles nested if", function () {
      const stack = evaluate("{ 1 {1 {77} if} if }");
      const expectedStack = [77];
      expect(stack).toEqual(expectedStack);
    });

    it("abs", function () {
      const stack = evaluate("{ -2 abs }");
      const expectedStack = [2];
      expect(stack).toEqual(expectedStack);
    });
    it("adds", function () {
      const stack = evaluate("{ 1 2 add }");
      const expectedStack = [3];
      expect(stack).toEqual(expectedStack);
    });
    it("boolean and", function () {
      const stack = evaluate("{ true false and }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("bitwise and", function () {
      const stack = evaluate("{ 254 1 and }");
      const expectedStack = [254 & 1];
      expect(stack).toEqual(expectedStack);
    });
    it("the angle in degrees (0-360) whose tangent is num/den.", function () {
      const stack = evaluate("{ 1 -1 atan }");
      const expectedStack = [135];
      expect(stack).toEqual(expectedStack);
    });
    it("handles bitshifting ", function () {
      const stack = evaluate("{ 50 2 bitshift }");
      const expectedStack = [200];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the ceiling value", function () {
      const stack = evaluate("{ 9.9 ceiling }");
      const expectedStack = [10];
      expect(stack).toEqual(expectedStack);
    });
    it("copies", function () {
      const stack = evaluate("{ 99 98 2 copy }");
      const expectedStack = [99, 98, 99, 98];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the cosine of an angle in degrees", function () {
      const stack = evaluate("{ 180 cos }");
      const expectedStack = [-1];
      expect(stack).toEqual(expectedStack);
    });
    it("converts to int", function () {
      const stack = evaluate("{ 9.9 cvi }");
      const expectedStack = [9];
      expect(stack).toEqual(expectedStack);
    });
    it("converts negatives to int", function () {
      const stack = evaluate("{ -9.9 cvi }");
      const expectedStack = [-9];
      expect(stack).toEqual(expectedStack);
    });
    it("converts to real", function () {
      const stack = evaluate("{ 55.34 cvr }");
      const expectedStack = [55.34];
      expect(stack).toEqual(expectedStack);
    });
    it("divides", function () {
      const stack = evaluate("{ 6 5 div }");
      const expectedStack = [1.2];
      expect(stack).toEqual(expectedStack);
    });
    it("maps division by zero to infinity", function () {
      const stack = evaluate("{ 6 0 div }");
      const expectedStack = [Infinity];
      expect(stack).toEqual(expectedStack);
    });
    it("duplicates", function () {
      const stack = evaluate("{ 99 dup }");
      const expectedStack = [99, 99];
      expect(stack).toEqual(expectedStack);
    });
    it("accepts an equality", function () {
      const stack = evaluate("{ 9 9 eq }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects an inequality", function () {
      const stack = evaluate("{ 9 8 eq }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("exchanges", function () {
      const stack = evaluate("{ 44 99 exch }");
      const expectedStack = [99, 44];
      expect(stack).toEqual(expectedStack);
    });
    it("handles exponentiation", function () {
      const stack = evaluate("{ 10 2 exp }");
      const expectedStack = [100];
      expect(stack).toEqual(expectedStack);
    });
    it("pushes false onto the stack", function () {
      const stack = evaluate("{ false }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the floor value", function () {
      const stack = evaluate("{ 9.9 floor }");
      const expectedStack = [9];
      expect(stack).toEqual(expectedStack);
    });
    it("handles greater than or equal to", function () {
      const stack = evaluate("{ 10 9 ge }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects less than for greater than or equal to", function () {
      const stack = evaluate("{ 8 9 ge }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("handles greater than", function () {
      const stack = evaluate("{ 10 9 gt }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects less than or equal for greater than", function () {
      const stack = evaluate("{ 9 9 gt }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("divides to integer", function () {
      const stack = evaluate("{ 2 3 idiv }");
      const expectedStack = [0];
      expect(stack).toEqual(expectedStack);
    });
    it("divides to negative integer", function () {
      const stack = evaluate("{ -2 3 idiv }");
      const expectedStack = [0];
      expect(stack).toEqual(expectedStack);
    });
    it("duplicates index", function () {
      const stack = evaluate("{ 4 3 2 1 2 index }");
      const expectedStack = [4, 3, 2, 1, 3];
      expect(stack).toEqual(expectedStack);
    });
    it("handles less than or equal to", function () {
      const stack = evaluate("{ 9 10 le }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects greater than for less than or equal to", function () {
      const stack = evaluate("{ 10 9 le }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the natural logarithm", function () {
      const stack = evaluate("{ 10 ln }");
      const expectedStack = [Math.log(10)];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the base 10 logarithm", function () {
      const stack = evaluate("{ 100 log }");
      const expectedStack = [2];
      expect(stack).toEqual(expectedStack);
    });
    it("handles less than", function () {
      const stack = evaluate("{ 9 10 lt }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects greater than or equal to for less than", function () {
      const stack = evaluate("{ 10 9 lt }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("performs the modulo operation", function () {
      const stack = evaluate("{ 4 3 mod }");
      const expectedStack = [1];
      expect(stack).toEqual(expectedStack);
    });
    it("multiplies two numbers (positive result)", function () {
      const stack = evaluate("{ 9 8 mul }");
      const expectedStack = [72];
      expect(stack).toEqual(expectedStack);
    });
    it("multiplies two numbers (negative result)", function () {
      const stack = evaluate("{ 9 -8 mul }");
      const expectedStack = [-72];
      expect(stack).toEqual(expectedStack);
    });
    it("accepts an inequality", function () {
      const stack = evaluate("{ 9 8 ne }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("rejects an equality", function () {
      const stack = evaluate("{ 9 9 ne }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("negates", function () {
      const stack = evaluate("{ 4.5 neg }");
      const expectedStack = [-4.5];
      expect(stack).toEqual(expectedStack);
    });
    it("boolean not", function () {
      const stack = evaluate("{ true not }");
      const expectedStack = [false];
      expect(stack).toEqual(expectedStack);
    });
    it("bitwise not", function () {
      const stack = evaluate("{ 12 not }");
      const expectedStack = [-13];
      expect(stack).toEqual(expectedStack);
    });
    it("boolean or", function () {
      const stack = evaluate("{ true false or }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("bitwise or", function () {
      const stack = evaluate("{ 254 1 or }");
      const expectedStack = [254 | 1];
      expect(stack).toEqual(expectedStack);
    });
    it("pops stack", function () {
      const stack = evaluate("{ 1 2 pop }");
      const expectedStack = [1];
      expect(stack).toEqual(expectedStack);
    });
    it("rolls stack right", function () {
      const stack = evaluate("{ 1 3 2 2 4 1 roll }");
      const expectedStack = [2, 1, 3, 2];
      expect(stack).toEqual(expectedStack);
    });
    it("rolls stack left", function () {
      const stack = evaluate("{ 1 3 2 2 4 -1 roll }");
      const expectedStack = [3, 2, 2, 1];
      expect(stack).toEqual(expectedStack);
    });
    it("rounds a number", function () {
      const stack = evaluate("{ 9.52 round }");
      const expectedStack = [10];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates the sine of an angle in degrees", function () {
      const stack = evaluate("{ 90 sin }");
      const expectedStack = [1];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates a square root (integer)", function () {
      const stack = evaluate("{ 100 sqrt }");
      const expectedStack = [10];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates a square root (float)", function () {
      const stack = evaluate("{ 99 sqrt }");
      const expectedStack = [Math.sqrt(99)];
      expect(stack).toEqual(expectedStack);
    });
    it("subtracts (positive result)", function () {
      const stack = evaluate("{ 6 4 sub }");
      const expectedStack = [2];
      expect(stack).toEqual(expectedStack);
    });
    it("subtracts (negative result)", function () {
      const stack = evaluate("{ 4 6 sub }");
      const expectedStack = [-2];
      expect(stack).toEqual(expectedStack);
    });
    it("pushes true onto the stack", function () {
      const stack = evaluate("{ true }");
      const expectedStack = [true];
      expect(stack).toEqual(expectedStack);
    });
    it("truncates a number", function () {
      const stack = evaluate("{ 35.004 truncate }");
      const expectedStack = [35];
      expect(stack).toEqual(expectedStack);
    });
    it("calculates an exclusive or value", function () {
      const stack = evaluate("{ 3 9 xor }");
      const expectedStack = [10];
      expect(stack).toEqual(expectedStack);
    });
  });
});
