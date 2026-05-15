import { renderHook } from "@testing-library/react";
import { useAuth } from "../../src/hooks/useAuth";
import { describe, it, expect } from "@jest/globals";

describe("useAuth Hook", () => {
  it("throws an error when used outside of AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});
