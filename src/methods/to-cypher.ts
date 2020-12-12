import { CypherComposer, Relationship, Node } from "../classes";
import { MatchStatement } from "../types";
import createMatchStatement from "./create-match-statement";

function toCypher(composer: CypherComposer): [string, any] {
  const results: {
    strs: string[];
    params: any;
  } = { strs: [], params: {} };

  const nodeMatchStatements = new Map<Node, MatchStatement>();
  const relationshipMatchStatements = new Map<Relationship, MatchStatement>();
  const returnNames: string[] = [];

  if (composer.returns?.length) {
    composer.returns.forEach((entity) => {
      returnNames.push(entity.name);

      if (entity instanceof Relationship) {
        if (!relationshipMatchStatements.has(entity)) {
          const matchStmt = createMatchStatement(entity);
          relationshipMatchStatements.set(entity, matchStmt as MatchStatement);

          [entity.to, entity.from].forEach((n) => {
            if (!nodeMatchStatements.has(n)) {
              const matchStmt = createMatchStatement(n);
              nodeMatchStatements.set(n, matchStmt as MatchStatement);
            }
          });
        }
      }

      if (entity instanceof Node) {
        if (!nodeMatchStatements.has(entity)) {
          const matchStmt = createMatchStatement(entity as Node);
          nodeMatchStatements.set(entity, matchStmt as MatchStatement);
        }
      }
    });
  }

  nodeMatchStatements.forEach((matchStmt) => {
    results.params = { ...results.params, ...matchStmt.args };
    results.strs.push(matchStmt.str);
  });

  relationshipMatchStatements.forEach((matchStmt) => {
    results.params = { ...results.params, ...matchStmt.args };
    results.strs.push(matchStmt.str);
  });

  if (returnNames.length) {
    results.strs.push(`RETURN ${returnNames.join(", ")}`);
  }

  return [results.strs.join("\n"), results.params];
}

export default toCypher;
