import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameControls } from "../GameControls";

describe("GameControls", () => {
  const defaultProps = {
    onHit: jest.fn(),
    onStand: jest.fn(),
    onDouble: jest.fn(),
    onSplit: jest.fn(),
    roundOver: false,
    isDealing: false,
    canDouble: true,
    canSplit: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all action buttons", () => {
    render(<GameControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: /hit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stand/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /double/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /split/i })).toBeInTheDocument();
  });

  it("should call onHit when hit button is clicked", async () => {
    const user = userEvent.setup();
    const onHit = jest.fn();
    render(<GameControls {...defaultProps} onHit={onHit} />);
    
    const hitButton = screen.getByRole("button", { name: /hit/i });
    await user.click(hitButton);
    
    expect(onHit).toHaveBeenCalledTimes(1);
  });

  it("should call onStand when stand button is clicked", async () => {
    const user = userEvent.setup();
    const onStand = jest.fn();
    render(<GameControls {...defaultProps} onStand={onStand} />);
    
    const standButton = screen.getByRole("button", { name: /stand/i });
    await user.click(standButton);
    
    expect(onStand).toHaveBeenCalledTimes(1);
  });

  it("should call onDouble when double button is clicked", async () => {
    const user = userEvent.setup();
    const onDouble = jest.fn();
    render(<GameControls {...defaultProps} onDouble={onDouble} />);
    
    const doubleButton = screen.getByRole("button", { name: /double/i });
    await user.click(doubleButton);
    
    expect(onDouble).toHaveBeenCalledTimes(1);
  });

  it("should call onSplit when split button is clicked", async () => {
    const user = userEvent.setup();
    const onSplit = jest.fn();
    render(<GameControls {...defaultProps} onSplit={onSplit} />);
    
    const splitButton = screen.getByRole("button", { name: /split/i });
    await user.click(splitButton);
    
    expect(onSplit).toHaveBeenCalledTimes(1);
  });

  it("should disable all buttons when round is over", () => {
    render(<GameControls {...defaultProps} roundOver={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      if (button.textContent !== "Double" && button.textContent !== "Split") {
        expect(button).toBeDisabled();
      }
    });
  });

  it("should disable all buttons when dealing", () => {
    render(<GameControls {...defaultProps} isDealing={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      if (button.textContent !== "Double" && button.textContent !== "Split") {
        expect(button).toBeDisabled();
      }
    });
  });

  it("should disable double button when canDouble is false", () => {
    render(<GameControls {...defaultProps} canDouble={false} />);
    const doubleButton = screen.getByRole("button", { name: /double/i });
    expect(doubleButton).toBeDisabled();
  });

  it("should disable split button when canSplit is false", () => {
    render(<GameControls {...defaultProps} canSplit={false} />);
    const splitButton = screen.getByRole("button", { name: /split/i });
    expect(splitButton).toBeDisabled();
  });
});

