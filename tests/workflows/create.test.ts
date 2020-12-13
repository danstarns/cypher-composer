import CypherComposer from "../../src";
import { trimmer } from "../../src/utils";

describe("create tests", () => {
  test("should create and return a single node", () => {
    const composer = new CypherComposer();

    const node = composer.create(
      composer.node("user", "User", { name: "dan" })
    );

    composer.return(node);

    const [cypher, params] = composer.toCypher();

    expect(trimmer(cypher)).toEqual(
      trimmer(`
            CREATE (user:User)
            SET user.name = $create_user_name
            RETURN user
      `)
    );

    expect(params).toEqual({
      create_user_name: "dan",
    });
  });
});
