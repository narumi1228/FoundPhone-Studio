import { describe, expect, it } from "vitest";
import { saveIdFor } from "./saveKey";

describe("story save isolation", () => {
  it("separates independent story IDs even when versions match", () => {
    expect(saveIdFor({ id: "simulator-a", updatedAt: 1 })).not.toBe(saveIdFor({ id: "simulator-b", updatedAt: 1 }));
  });
  it("separates revisions of the same story", () => {
    expect(saveIdFor({ id: "simulator-a", updatedAt: 1 })).not.toBe(saveIdFor({ id: "simulator-a", updatedAt: 2 }));
  });
  it("safely encodes IDs containing separators", () => {
    expect(saveIdFor({ id: "a@b", updatedAt: 1 })).toBe("story:a%40b@1");
  });
});
