import { fireEvent, render } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";
import TestRenderer from "react-test-renderer";

const { ipcRenderer } = require("electron");

import { AppContext } from "../context/App";
import { LoginRoute } from "./Login";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("routes/Login.tsx", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.spyOn(ipcRenderer, "send");
  });

  it("should render itself & its children", () => {
    const tree = TestRenderer.create(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it("should redirect to notifications once logged in", () => {
    const { rerender } = render(
      <AppContext.Provider value={{ isLoggedIn: false }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    rerender(
      <AppContext.Provider value={{ isLoggedIn: true }}>
        <MemoryRouter>
          <LoginRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith("reopen-window");
    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/", { replace: true });
  });

  it("should navigate to login with github enterprise", () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <LoginRoute />
      </MemoryRouter>,
    );

    fireEvent.click(getByLabelText("Login with GitHub Enterprise"));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/login-enterprise");
  });
});
