import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gradeRoomTaskAnswer, normalizeTextAnswer } from "./task-grading";

describe("normalizeTextAnswer", () => {
  it("trims and lowercases", () => {
    assert.equal(normalizeTextAnswer("  Hello  "), "hello");
  });
});

describe("gradeRoomTaskAnswer TEXT", () => {
  const baseTask = {
    answerType: "TEXT" as const,
    correctAnswer: "42",
    supportsMultipleAnswers: false,
    alternativeAnswers: [{ answerText: "forty-two" }],
    choiceOptions: [],
  };

  it("accepts primary answer", () => {
    const result = gradeRoomTaskAnswer(baseTask, { answerText: "42" });
    assert.equal(result.status, "CORRECT");
    assert.equal(result.isCorrect, true);
  });

  it("accepts alternative answer", () => {
    const result = gradeRoomTaskAnswer(baseTask, { answerText: "Forty-Two" });
    assert.equal(result.status, "CORRECT");
  });

  it("rejects wrong answer", () => {
    const result = gradeRoomTaskAnswer(baseTask, { answerText: "43" });
    assert.equal(result.status, "INCORRECT");
    assert.equal(result.isCorrect, false);
  });
});

describe("gradeRoomTaskAnswer CHOICE", () => {
  const task = {
    answerType: "CHOICE" as const,
    correctAnswer: null,
    supportsMultipleAnswers: false,
    alternativeAnswers: [],
    choiceOptions: [
      { id: "a", isCorrect: true },
      { id: "b", isCorrect: false },
    ],
  };

  it("requires exact correct option", () => {
    assert.equal(
      gradeRoomTaskAnswer(task, { selectedOptionIds: ["a"] }).status,
      "CORRECT",
    );
    assert.equal(
      gradeRoomTaskAnswer(task, { selectedOptionIds: ["b"] }).status,
      "INCORRECT",
    );
  });
});

describe("gradeRoomTaskAnswer IMAGE", () => {
  it("submits when image provided", () => {
    const result = gradeRoomTaskAnswer(
      {
        answerType: "IMAGE",
        correctAnswer: null,
        supportsMultipleAnswers: false,
        alternativeAnswers: [],
        choiceOptions: [],
      },
      { imageUrl: "/uploads/tasks/test.jpg" },
    );
    assert.equal(result.status, "SUBMITTED");
    assert.equal(result.isCorrect, null);
  });
});
