import { renderHook, act } from "@testing-library/react";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import type React from "react";
import { LoginCredentials, RegisterPayload } from "@/types";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require("@/hooks/useAuth");
const { useAuthForm } = require("@/hooks/useAuthForm");

describe("useAuthForm Hook", () => {
  const mockLogin = jest.fn<(credentials: LoginCredentials) => Promise<void>>();

  const mockRegister = jest.fn<(payload: RegisterPayload) => Promise<void>>();

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);

    useAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      user: null,
      loading: false,
      mounted: true,
      logout: jest.fn(),
      isAuthenticated: false,
    });
  });

  it("updates formData when fields change", () => {
    const { result } = renderHook(() => useAuthForm("login"));

    act(() => {
      result.current.handleChange({
        target: {
          name: "email",
          value: "test@archive.com",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.email).toBe("test@archive.com");
  });

  it("calls login when in login mode", async () => {
    const { result } = renderHook(() => useAuthForm("login"));

    act(() => {
      result.current.handleChange({
        target: {
          name: "email",
          value: "test@archive.com",
        },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleChange({
        target: {
          name: "password",
          value: "password123",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.SyntheticEvent);
    });

    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@archive.com",
      password: "password123",
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("calls register when in register mode", async () => {
    const { result } = renderHook(() => useAuthForm("register"));

    act(() => {
      result.current.handleChange({
        target: {
          name: "username",
          value: "tester",
        },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleChange({
        target: {
          name: "email",
          value: "test@archive.com",
        },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleChange({
        target: {
          name: "password",
          value: "password123",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.SyntheticEvent);
    });

    expect(mockRegister).toHaveBeenCalledWith({
      username: "tester",
      email: "test@archive.com",
      password: "password123",
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
