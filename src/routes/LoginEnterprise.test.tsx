import { fireEvent, render, screen } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import * as TestRenderer from "react-test-renderer";

const { ipcRenderer } = require("electron");

import { mockedEnterpriseAccounts } from "../__mocks__/mockedData";
import { AppContext } from "../context/App";
import type { AuthState } from "../types";
import { LoginEnterpriseRoute, validate } from "./LoginEnterprise";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("routes/LoginEnterprise.tsx", () => {
  const mockAccounts: AuthState = {
    enterpriseAccounts: [],
    user: null,
  };

  beforeEach(() => {
    mockNavigate.mockReset();

    jest.spyOn(ipcRenderer, "send");
  });

  it("renders correctly", () => {
    const tree = TestRenderer.create(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it("let us go back", () => {
    render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText("Go Back"));
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it("should validate the form values", () => {
    const emptyValues = {
      hostname: null,
      clientId: null,
      clientSecret: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validate(values).hostname).toBe("Required");
    expect(validate(values).clientId).toBe("Required");
    expect(validate(values).clientSecret).toBe("Required");

    values = {
      ...emptyValues,
      hostname: "hello",
      clientId: "!@£INVALID-.1",
      clientSecret: "!@£INVALID-.1",
    };
    expect(validate(values).hostname).toBe("Invalid hostname.");
    expect(validate(values).clientId).toBe("Invalid client id.");
    expect(validate(values).clientSecret).toBe("Invalid client secret.");
  });

  it("should receive a logged-in enterprise account", () => {
    const { rerender } = render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider
        value={{
          accounts: {
            enterpriseAccounts: mockedEnterpriseAccounts,
            user: null,
          },
        }}
      >
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith("reopen-window");
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it("should render the form with errors", () => {
    const { getByLabelText, getByTitle, getByText } = render(
      <AppContext.Provider value={{ accounts: mockAccounts }}>
        <MemoryRouter>
          <LoginEnterpriseRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(getByLabelText("Hostname"), {
      target: { value: "test" },
    });
    fireEvent.change(getByLabelText("Client ID"), {
      target: { value: "123" },
    });
    fireEvent.change(getByLabelText("Client Secret"), {
      target: { value: "abc" },
    });

    fireEvent.submit(getByTitle("Login Button"));

    expect(getByText("Invalid hostname.")).toBeTruthy();
    expect(getByText("Invalid client id.")).toBeTruthy();
    expect(getByText("Invalid client secret.")).toBeTruthy();
  });
});
