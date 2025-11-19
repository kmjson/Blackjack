import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BettingControls } from "../BettingControls";
import { MIN_BET, MAX_BET } from "../../constants";

describe("BettingControls", () => {
  const defaultProps = {
    balance: 1000,
    betAmount: 50,
    onBetAmountChange: jest.fn(),
    onDeal: jest.fn(),
    onStartOver: jest.fn(),
    roundOver: true,
    isDealing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display balance", () => {
    render(<BettingControls {...defaultProps} balance={500} />);
    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("should display warning when balance is below minimum", () => {
    render(<BettingControls {...defaultProps} balance={5} />);
    expect(screen.getByText(`You need at least $${MIN_BET} to play.`)).toBeInTheDocument();
  });

  it("should display current bet amount", () => {
    render(<BettingControls {...defaultProps} betAmount={25} />);
    const numberInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(numberInput.value).toBe("25");
  });

  it("should have slider input", () => {
    render(<BettingControls {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("min", String(MIN_BET));
    expect(slider).toHaveAttribute("max", String(MAX_BET));
  });

  it("should call onBetAmountChange when slider changes", () => {
    const onBetAmountChange = jest.fn();
    render(<BettingControls {...defaultProps} onBetAmountChange={onBetAmountChange} />);
    
    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "30" } });
    
    expect(onBetAmountChange).toHaveBeenCalled();
  });

  it("should call onDeal when deal button is clicked", async () => {
    const user = userEvent.setup();
    const onDeal = jest.fn();
    render(<BettingControls {...defaultProps} onDeal={onDeal} />);
    
    const dealButton = screen.getByRole("button", { name: /deal/i });
    await user.click(dealButton);
    
    expect(onDeal).toHaveBeenCalledTimes(1);
  });

  it("should disable deal button when round is not over", () => {
    render(<BettingControls {...defaultProps} roundOver={false} />);
    const dealButton = screen.getByRole("button", { name: /deal/i });
    expect(dealButton).toBeDisabled();
  });

  it("should disable deal button when dealing", () => {
    render(<BettingControls {...defaultProps} isDealing={true} />);
    const dealButton = screen.getByRole("button", { name: /deal/i });
    expect(dealButton).toBeDisabled();
  });

  it("should disable inputs when round is not over", () => {
    render(<BettingControls {...defaultProps} roundOver={false} />);
    const slider = screen.getByRole("slider");
    const numberInput = screen.getByRole("spinbutton");
    expect(slider).toBeDisabled();
    expect(numberInput).toBeDisabled();
  });

  it("should show 'Start Over' button when balance is below minimum", () => {
    render(<BettingControls {...defaultProps} balance={5} />);
    const button = screen.getByRole("button", { name: /start over/i });
    expect(button).toBeInTheDocument();
  });

  it("should call onStartOver when 'Start Over' button is clicked", async () => {
    const user = userEvent.setup();
    const onStartOver = jest.fn();
    render(<BettingControls {...defaultProps} balance={5} onStartOver={onStartOver} />);
    
    const button = screen.getByRole("button", { name: /start over/i });
    await user.click(button);
    
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });

  it("should disable inputs when game is over", () => {
    render(<BettingControls {...defaultProps} balance={5} />);
    const slider = screen.getByRole("slider");
    const numberInput = screen.getByRole("spinbutton");
    expect(slider).toBeDisabled();
    expect(numberInput).toBeDisabled();
  });

  it("should enable 'Start Over' button when game is over", () => {
    render(<BettingControls {...defaultProps} balance={5} />);
    const button = screen.getByRole("button", { name: /start over/i });
    expect(button).not.toBeDisabled();
  });
});

