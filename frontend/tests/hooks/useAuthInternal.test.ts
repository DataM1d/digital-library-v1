import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("@/lib/router", () => ({
  useAppRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/lib/api", () => ({
  api: {
    auth: {
      login: jest.fn(),
      register: jest.fn(),
    },
  },
  UserSchema: {
    safeParse: (data: unknown) => ({ success: true, data }),
  },
}));

const { useAuthInternal } = require("@/hooks/useAuthInternal");

describe("useAuthInternal Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("initializes correctly", async () => {
    const { result } = renderHook(() => useAuthInternal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("hydrates state from localStorage on mount", async () => {
    const user = { id: 1, username: "testuser" };

    localStorage.setItem("token", "valid-token");
    localStorage.setItem("user", JSON.stringify(user));

    const { result } = renderHook(() => useAuthInternal());

    await waitFor(() => {
      expect(result.current.user?.username).toBe("testuser");
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clears state on logout", async () => {
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, username: "tester" }));

    const { result } = renderHook(() => useAuthInternal());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
