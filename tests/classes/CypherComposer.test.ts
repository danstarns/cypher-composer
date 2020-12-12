import CypherComposer from "../../src/classes/CypherComposer";

describe("CypherComposer", () => {
  test("should construct", () => {
    const composer = new CypherComposer();

    expect(composer).toBeInstanceOf(CypherComposer);
  });

  describe("node", () => {
    test("should return existing node", () => {
      const composer = new CypherComposer();

      const node1 = composer.node("test");
      const node2 = composer.node("test");

      expect(node1).toEqual(node2);
    });

    test("should throw duplicate identifier when adding a new node", () => {
      const composer = new CypherComposer();

      try {
        composer.node("test");
        composer.node("test", ["Label"]);

        throw new Error("i should not throw");
      } catch (error) {
        expect(error.message).toEqual("duplicate identifier test");
      }
    });
  });

  describe("relationship", () => {
    test("should return existing relationship", () => {
      const composer = new CypherComposer();

      const node1 = composer.node("test1");
      const node2 = composer.node("test2");

      const rel1 = composer.relationship({
        from: node1,
        to: node2,
        label: "TEST",
        name: "abc",
      });
      const rel2 = composer.relationship("abc");

      expect(rel1).toEqual(rel2);
    });

    test("should throw duplicate identifier when adding a new node", () => {
      const composer = new CypherComposer();

      const node1 = composer.node("node1");
      const node2 = composer.node("node2");

      composer.relationship({
        from: node1,
        to: node2,
        label: "TEST",
        name: "test",
      });

      try {
        composer.relationship({
          from: node1,
          to: node2,
          label: "TEST",
          name: "test",
        });

        throw new Error("i should not throw");
      } catch (error) {
        expect(error.message).toEqual("duplicate identifier test");
      }
    });
  });
});
