import * as TestRenderer from "react-test-renderer";

import { mockMathRandom } from "./test-utils";

import { Oops } from "./Oops";

describe("components/Oops.tsx", () => {
  // The error emoji randomly rotates, but then the snapshots would never match
  // Have to make it consistent so the emojis are always the same
  mockMathRandom(0.1);

  it("should render itself & its children", () => {
    const tree = TestRenderer.create(<Oops />);

    expect(tree).toMatchSnapshot();
  });
});
