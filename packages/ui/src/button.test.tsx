import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders the provided text", () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("applies the secondary variant styles", () => {
    render(<Button variant="secondary">Variant</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-brand");
  });
});
