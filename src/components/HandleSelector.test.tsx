import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { HandleSelector } from "./HandleSelector";
import type { StoredHandle } from "../types/auth";

describe("HandleSelector", () => {
  afterEach(() => {
    cleanup();
  });

  const mockHandles: StoredHandle[] = [
    {
      handle: "user.bsky.social",
      lastUsed: Date.now(),
      type: "handle",
      profile: {
        displayName: "Test User",
        avatar: "https://example.com/avatar.jpg",
      },
      pdsUrl: "https://bsky.social",
    },
  ];

  it("should render nothing when handles array is empty", () => {
    const { container } = render(
      <HandleSelector handles={[]} onSelect={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render handles when provided", () => {
    render(
      <HandleSelector
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(/@user\.bsky\.social/)).toBeInTheDocument();
    expect(screen.getByText(/via https:\/\/bsky\.social/)).toBeInTheDocument();
  });

  it("should call onSelect when handle is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <HandleSelector
        handles={mockHandles}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const handleButton = buttons.find((btn) =>
      btn.textContent?.includes("user.bsky.social"),
    );

    if (handleButton) {
      await user.click(handleButton);
    }

    expect(onSelect).toHaveBeenCalledWith("user.bsky.social");
  });

  it("should not show delete buttons when editMode is false", () => {
    render(
      <HandleSelector
        editMode={false}
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Delete account")).not.toBeInTheDocument();
  });

  it("should show delete buttons when editMode is true", () => {
    render(
      <HandleSelector
        editMode={true}
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Delete account")).toBeInTheDocument();
  });

  it("should allow deleting handle in edit mode", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <HandleSelector
        editMode={true}
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={onDelete}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete account");
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith("user.bsky.social");
  });

  it("should prevent event bubbling when delete is clicked", async () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <HandleSelector
        editMode={true}
        handles={mockHandles}
        onSelect={onSelect}
        onDelete={onDelete}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete account");
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith("user.bsky.social");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("should render add account button", () => {
    render(
      <HandleSelector
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Add account")).toBeInTheDocument();
  });

  it("should call onAdd when add account button is clicked", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(
      <HandleSelector
        handles={mockHandles}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        onAdd={onAdd}
      />,
    );

    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((btn) =>
      btn.textContent?.includes("Add account"),
    );

    if (addButton) {
      await user.click(addButton);
    }

    expect(onAdd).toHaveBeenCalled();
  });
});
