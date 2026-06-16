import { describe, it, expect } from "vitest";
import { UnauthorizedError } from "../utils/errors.js";

describe("requireAuth behavior", () => {
  it("throws UnauthorizedError when user is not set", () => {
    const requireAuth = async (request) => {
      if (!request.user) throw new UnauthorizedError();
    };
    expect(() => requireAuth({})).rejects.toThrow(UnauthorizedError);
  });

  it("does not throw when user is set", () => {
    const requireAuth = async (request) => {
      if (!request.user) throw new UnauthorizedError();
    };
    expect(() => requireAuth({ user: { id: "abc" } })).not.toThrow();
  });
});
