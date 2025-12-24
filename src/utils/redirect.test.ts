import { describe, it, expect } from "vitest";
import {
  parseAuthParams,
  buildRedirectUrl,
  validateHandle,
  validatePdsUrl,
  detectInputType,
} from "./redirect";

describe("redirect utilities", () => {
  describe("parseAuthParams", () => {
    it("should parse valid query params", () => {
      const result = parseAuthParams(
        "?redirect_uri=https://app.com/callback&nonce=abc123",
      );

      expect(result).toEqual({
        redirect_uri: "https://app.com/callback",
        nonce: "abc123",
      });
    });

    it("should return null when redirect_uri is missing", () => {
      const result = parseAuthParams("?nonce=abc123");
      expect(result).toBeNull();
    });

    it("should return null when nonce is missing", () => {
      const result = parseAuthParams("?redirect_uri=https://app.com/callback");
      expect(result).toBeNull();
    });

    it("should handle empty search string", () => {
      const result = parseAuthParams("");
      expect(result).toBeNull();
    });
  });

  describe("buildRedirectUrl", () => {
    it("should append params to URL without existing query", () => {
      const result = buildRedirectUrl(
        "https://app.com/callback",
        "nonce123",
        "user.bsky.social",
      );

      expect(result).toContain("nonce=nonce123");
      expect(result).toContain("hint=user.bsky.social");
    });

    it("should append params to URL with existing query", () => {
      const result = buildRedirectUrl(
        "https://app.com/callback?existing=param",
        "nonce123",
        "user.bsky.social",
      );

      expect(result).toContain("existing=param");
      expect(result).toContain("nonce=nonce123");
      expect(result).toContain("hint=user.bsky.social");
    });

    it("should encode special characters", () => {
      const result = buildRedirectUrl(
        "https://app.com/callback",
        "nonce 123",
        "user@special",
      );

      expect(result).toMatch(/nonce=(nonce\+123|nonce%20123)/);
      expect(result).toContain("hint=user%40special");
    });

    it("should handle invalid URLs gracefully", () => {
      const result = buildRedirectUrl(
        "not-a-url",
        "nonce123",
        "user.bsky.social",
      );

      expect(result).toContain("nonce=nonce123");
      expect(result).toContain("hint=user.bsky.social");
    });
  });

  describe("validateHandle", () => {
    it("should validate correct handle format", () => {
      expect(validateHandle("user.bsky.social")).toBe(true);
      expect(validateHandle("my-handle.example.com")).toBe(true);
      expect(validateHandle("test123.domain.co.uk")).toBe(true);
    });

    it("should reject invalid handle formats", () => {
      expect(validateHandle("nodomains")).toBe(false);
      expect(validateHandle("user@bsky.social")).toBe(false);
      expect(validateHandle("")).toBe(false);
      expect(validateHandle("user..bsky.social")).toBe(false);
    });
  });

  describe("validatePdsUrl", () => {
    it("should validate https URLs", () => {
      expect(validatePdsUrl("https://pds.example.com")).toBe(true);
    });

    it("should validate http URLs", () => {
      expect(validatePdsUrl("http://localhost:3000")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(validatePdsUrl("not-a-url")).toBe(false);
      expect(validatePdsUrl("ftp://example.com")).toBe(false);
      expect(validatePdsUrl("")).toBe(false);
    });
  });

  describe("detectInputType", () => {
    it("should detect handle type", () => {
      expect(detectInputType("user.bsky.social")).toBe("handle");
      expect(detectInputType("my-handle.example.com")).toBe("handle");
    });

    it("should detect pds type", () => {
      expect(detectInputType("https://pds.example.com")).toBe("pds");
      expect(detectInputType("http://localhost:3000")).toBe("pds");
    });

    it("should return null for invalid input", () => {
      expect(detectInputType("invalid")).toBeNull();
      expect(detectInputType("")).toBeNull();
    });

    it("should prioritize pds over handle when both could match", () => {
      expect(detectInputType("https://user.bsky.social")).toBe("pds");
    });
  });
});
