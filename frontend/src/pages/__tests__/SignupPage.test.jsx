import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SignupPage from "../SignupPage";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  );
}

async function fillAndSubmit(user, { name, email, password } = {}) {
  if (name !== undefined) {
    await user.type(screen.getByLabelText("Name"), name);
  }
  if (email !== undefined) {
    await user.type(screen.getByLabelText("Email"), email);
  }
  if (password !== undefined) {
    await user.type(screen.getByLabelText("Password"), password);
  }
  await user.click(screen.getByRole("button", { name: "Sign up" }));
}

describe("SignupPage", () => {
  const mockSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ signup: mockSignup });
  });

  test("renders name, email, and password fields and a submit button", () => {
    renderSignupPage();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  test("lets the user type into all fields", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText("Name"), "Khushi");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");

    expect(screen.getByLabelText("Name")).toHaveValue("Khushi");
    expect(screen.getByLabelText("Email")).toHaveValue("test@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("password123");
  });

  test("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Show password"));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByLabelText("Hide password"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("calls signup with entered values and navigates to /login on success", async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValueOnce({ id: "1", name: "Khushi" });
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "test@example.com",
      password: "password123",
    });

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        "Khushi",
        "test@example.com",
        "password123"
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows a loading state on the submit button while submitting", async () => {
    const user = userEvent.setup();
    let resolveSignup;
    mockSignup.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSignup = resolve;
      })
    );
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "test@example.com",
      password: "password123",
    });

    expect(screen.getByText("Creating account...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Creating account/ })
    ).toBeDisabled();

    resolveSignup({ id: "1", name: "Khushi" });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  test("shows a general error message when signup fails without field errors", async () => {
    const user = userEvent.setup();
    mockSignup.mockRejectedValueOnce({
      response: { data: { message: "Email already in use" } },
    });
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "test@example.com",
      password: "password123",
    });

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows a generic fallback error when there is no server message", async () => {
    const user = userEvent.setup();
    mockSignup.mockRejectedValueOnce(new Error("Network Error"));
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "test@example.com",
      password: "password123",
    });

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  test("shows field-level validation errors when the server returns an errors array", async () => {
    const user = userEvent.setup();
    mockSignup.mockRejectedValueOnce({
      response: {
        data: {
          errors: [
            { field: "email", message: "Email is already taken" },
            { field: "password", message: "Password must be at least 6 characters" },
          ],
        },
      },
    });
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "taken@example.com",
      password: "123",
    });

    expect(
      await screen.findByText("Email is already taken")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("clears previous errors when submitting again", async () => {
    const user = userEvent.setup();
    mockSignup
      .mockRejectedValueOnce({
        response: { data: { message: "Email already in use" } },
      })
      .mockResolvedValueOnce({ id: "1", name: "Khushi" });
    renderSignupPage();

    await fillAndSubmit(user, {
      name: "Khushi",
      email: "test@example.com",
      password: "password123",
    });
    expect(await screen.findByText("Email already in use")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(screen.queryByText("Email already in use")).not.toBeInTheDocument();
    });
  });

  test("has a link to the login page", () => {
    renderSignupPage();

    const loginLink = screen.getByRole("link", { name: "Log in" });
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
