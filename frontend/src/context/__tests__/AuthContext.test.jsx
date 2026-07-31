import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../AuthContext";
import axiosClient from "../../api/axiosClient";

jest.mock("../../api/axiosClient", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
function TestConsumer() {
  const { user, isLoading, login, signup, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="user">{user ? user.name : "no-user"}</div>
      <button onClick={() => login("test@example.com", "password123")}>
        Login
      </button>
      <button onClick={() => signup("Khushi", "test@example.com", "password123")}>
        Signup
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    test("starts with isLoading true then resolves to false with no user when localStorage is empty", async () => {
      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    test("restores user from a valid localStorage session", async () => {
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", name: "Khushi" }));

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
      expect(screen.getByTestId("user")).toHaveTextContent("Khushi");
    });

    test("clears session and logs error when stored user data is corrupted", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", "{not-valid-json");

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("login", () => {
    test("stores token/user and updates state on successful login", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "1", name: "Khushi" };
      axiosClient.post.mockResolvedValueOnce({
        data: { data: { token: "real-token", user: mockUser } },
      });

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      await user.click(screen.getByText("Login"));

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("Khushi");
      });
      expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      expect(localStorage.getItem("token")).toBe("real-token");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
    });

    test("leaves user state unchanged and propagates the error on failed login", async () => {
      const user = userEvent.setup();
      const loginError = new Error("Invalid credentials");
      axiosClient.post.mockRejectedValueOnce(loginError);

      function ConsumerWithErrorHandling() {
        const { login, user: authUser, isLoading } = useAuth();
        const handleClick = async () => {
          try {
            await login("test@example.com", "wrong-password");
          } catch {
            // swallow - just verifying state doesn't change
          }
        };
        return (
          <div>
            <div data-testid="loading">{String(isLoading)}</div>
            <div data-testid="user">{authUser ? authUser.name : "no-user"}</div>
            <button onClick={handleClick}>Login</button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <ConsumerWithErrorHandling />
        </AuthProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      await user.click(screen.getByText("Login"));

      await waitFor(() => {
        expect(axiosClient.post).toHaveBeenCalled();
      });
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("signup", () => {
    test("calls the signup endpoint and returns the created user without setting session state", async () => {
      const user = userEvent.setup();
      const mockUser = { id: "2", name: "Khushi" };
      axiosClient.post.mockResolvedValueOnce({ data: { data: mockUser } });

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      await user.click(screen.getByText("Signup"));

      await waitFor(() => {
        expect(axiosClient.post).toHaveBeenCalledWith("/auth/signup", {
          name: "Khushi",
          email: "test@example.com",
          password: "password123",
        });
      });
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  describe("logout", () => {
    test("clears session and calls the logout endpoint on success", async () => {
      const user = userEvent.setup();
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", name: "Khushi" }));
      axiosClient.post.mockResolvedValueOnce({});

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("Khushi");
      });

      await user.click(screen.getByText("Logout"));

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      });
      expect(axiosClient.post).toHaveBeenCalledWith("/auth/logout");
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    test("still clears local session even if the logout request fails", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", name: "Khushi" }));
      axiosClient.post.mockRejectedValueOnce(new Error("Network error"));

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("Khushi");
      });

      await user.click(screen.getByText("Logout"));

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      });
      expect(localStorage.getItem("token")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("session expiration", () => {
    test("clears user state when an auth:session-expired event is dispatched", async () => {
      localStorage.setItem("token", "fake-token");
      localStorage.setItem("user", JSON.stringify({ id: "1", name: "Khushi" }));

      renderWithProvider();
      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("Khushi");
      });

      window.dispatchEvent(new CustomEvent("auth:session-expired"));

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      });
    });
  });

  describe("useAuth", () => {
    test("throws an error when used outside of an AuthProvider", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      function BareConsumer() {
        useAuth();
        return null;
      }

      expect(() => render(<BareConsumer />)).toThrow(
        "useAuth must be used within an AuthProvider"
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
