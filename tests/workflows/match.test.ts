import CypherComposer from "../../src";
import { trimmer } from "../../src/utils";

describe("match tests", () => {
  test("should return the correct cypher with a single node and where match", () => {
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

    expect(params).toEqual({
      user_name: "dan",
    });
  });

  test("should match and return a relationship", () => {
    const composer = new CypherComposer();

    const user = composer.node("user", "User").where({ name: "dan" });
    const posts = composer.node("posts", "Post");
    const hasPosts = composer.relationship({
      from: user,
      to: posts,
      label: "HAS_POSTS",
      name: "hasPost",
    });

    composer.return(hasPosts);

    const [cypher, params] = composer.toCypher();

    expect(trimmer(cypher)).toEqual(
      trimmer(`
        MATCH (posts:Post) 
        MATCH (user:User) 
        WHERE user.name = $user_name 
        MATCH (user)-[hasPost:HAS_POSTS]->(posts) 
        RETURN hasPost
      `)
    );

    expect(params).toEqual({ user_name: "dan" });
  });
});
