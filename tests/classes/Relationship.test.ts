import Relationship from "../../src/classes/Relationship";

describe("Relationship", () => {
  test("should construct", () => {
    // @ts-ignore
    const composer = new Relationship({});

    expect(composer).toBeInstanceOf(Relationship);
  });
});
