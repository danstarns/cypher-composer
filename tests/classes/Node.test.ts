import Node from "../../src/classes/Node";

describe("Node", () => {
  test("should construct", () => {
    // @ts-ignore
    const composer = new Node({});

    expect(composer).toBeInstanceOf(Node);
  });
});
