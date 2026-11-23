import { describe, expect, it } from "vitest";
import { invitationAuthHref, invitationDestination } from "./navigation";

describe("invitation return destinations", () => {
  const reference = "0123456789abcdef01234567";

  it("preserves the reference across login and registration", () => {
    expect(invitationDestination(reference)).toBe(`/invite?ref=${reference}`);
    expect(invitationAuthHref("/login", reference)).toBe(`/login?invite=${reference}`);
    expect(invitationAuthHref("/register", reference)).toBe(`/register?invite=${reference}`);
  });

  it.each([undefined, "", "//example.com", "/dashboard", "abc&next=//example.com", [reference]])(
    "rejects invalid references (%j)",
    (value) => {
      expect(invitationDestination(value)).toBeNull();
      expect(invitationAuthHref("/login", value)).toBe("/login");
    },
  );
});
