import CypherComposer from "../src";
import { trimmer } from "../src/utils";

describe("index tests", () => {
  test("should return the correct cypher", () => {
    const composer = new CypherComposer();

    const node = composer.node("user", "User").where({ name: "dan" });

    composer.return(node);

    const [cypher, params] = composer.toCypher();

    expect(trimmer(cypher)).toEqual(
      trimmer(`
            MATCH (user:User)
            WHERE user.name = $user_name
            RETURN user
      `)
    );

    expect(params).toMatchObject({
      user_name: "dan",
    });
  });
});
