import { afterEach, describe, expect, test, fireEvent, mock } from "bun:test";
import React from "react";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { DenomImage } from "@/components/factory/components/DenomImage";
import matchers from "@testing-library/jest-dom/matchers";
import { renderWithChainProvider } from "@/tests/render";

expect.extend(matchers);

// A cute little candle gif
const uri =
  "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHg1aHVqa3NoMG45bzYwbHR5ODk3b2JqbHhnemlmcXpjOXB0enExMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zHcirZSkw8RSDhawFl/giphy.gif";

// Mock next/image
mock.module("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

const renderWithProps = (props = {}) => {
  const defaultProps = {
    denom: {
      base: "umfx",
      uri: uri,
    },
  };
  return renderWithChainProvider(<DenomImage {...defaultProps} {...props} />);
};

describe("DenomImage", () => {
  afterEach(cleanup);

  test("renders loading state correctly", () => {
    renderWithProps();
    expect(screen.getByLabelText("denom image skeleton")).toBeInTheDocument();
  });

  test("renders MFX token image correctly", async () => {
    renderWithProps();
    await waitFor(
      () => expect(screen.getByAltText("MFX Token Icon")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  test("renders ProfileAvatar for unsupported URL", async () => {
    renderWithProps({
      denom: { base: "unsupported", uri: "https://unsupported.com/token.png" },
    });
    await waitFor(
      () => expect(screen.getByAltText("Profile Avatar")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });

  test("renders image from supported URL", async () => {
    renderWithProps({ denom: { base: "supported", uri: uri } });
    await waitFor(
      () => expect(screen.getByAltText("Token Icon")).toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
});
