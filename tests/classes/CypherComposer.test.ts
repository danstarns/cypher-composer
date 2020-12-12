import CypherComposer from "../../src/classes/CypherComposer";

describe("CypherComposer", () => {
  test("should construct", () => {
    const composer = new CypherComposer();

    expect(composer).toBeInstanceOf(CypherComposer);
  });
});
