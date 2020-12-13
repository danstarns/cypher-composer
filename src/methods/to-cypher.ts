import { CypherComposer, Relationship, Node } from "../classes";
import { MatchStatement, CreateStatement } from "../types";
import createCreateStatement from "./create-create-statement";
import createMatchStatement from "./create-match-statement";

function toCypher(composer: CypherComposer): [string, any] {
  const results: {
    strs: string[];
    params: any;
  } = { strs: [], params: {} };

  const nodeMatchStatements = new Map<Node, MatchStatement>();
  const relationshipMatchStatements = new Map<Relationship, MatchStatement>();
  const nodeCreateStatements = new Map<Node, CreateStatement>();
  const returnNames: string[] = [];

  if (composer.returns?.length) {
    composer.returns.forEach((entity) => {
      returnNames.push(entity.name);

      if (entity instanceof Relationship) {
        if (!relationshipMatchStatements.has(entity)) {
          const matchStmt = createMatchStatement(entity);
          relationshipMatchStatements.set(entity, matchStmt as MatchStatement);

          [entity.to, entity.from].forEach((n) => {
            if (!nodeMatchStatements.has(n) && n.type === "MATCH") {
              const matchStmt = createMatchStatement(n);
              nodeMatchStatements.set(n, matchStmt as MatchStatement);
            }
          });
        }
      }

      if (entity instanceof Node) {
        if (entity.type !== "MATCH") {
          return;
        }

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

  if (composer.operations?.length) {
    const creates = composer.operations.filter((x) => x.kind === "CREATE");

    creates.forEach((create) => {
      if (nodeCreateStatements.has(create.entity)) {
        throw new Error(`cannot create ${create.entity} more than once`);
      }

      const createStmt = createCreateStatement({
        entity: create.entity,
        chainStr: "create",
      });
      nodeCreateStatements.set(create.entity, createStmt);
      results.params = { ...results.params, ...createStmt.args };
      results.strs.push(createStmt.str);
    });
  }

  if (returnNames.length) {
    results.strs.push(`RETURN ${returnNames.join(", ")}`);
  }

  return [results.strs.join("\n"), results.params];
}

export default toCypher;
