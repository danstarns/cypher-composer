import { CypherComposer, Relationship, Node } from "../classes";
import { MatchStatement, WhereClause } from "../types";
import createMatchStatement from "./create-match-statement";

function toCypher(composer: CypherComposer): [string, any] {
  const results: {
    strs: string[];
    params: any;
  } = { strs: [], params: {} };

  const nodeMatchStatements = new Map<Node, MatchStatement<"NODE">>();
  const relationshipMatchStatements = new Map<
    Relationship,
    MatchStatement<"RELATIONSHIP">
  >();

  if (composer.returns?.length) {
    const returnNames: string[] = [];

    composer.returns.forEach((entity) => {
      returnNames.push(entity.name);

      if (entity instanceof Relationship) {
        if (!relationshipMatchStatements.has(entity)) {
          const matchStmt = createMatchStatement(entity);
          relationshipMatchStatements.set(
            entity,
            matchStmt as MatchStatement<"RELATIONSHIP">
          );

          [entity.to, entity.from].forEach((n) => {
            if (!nodeMatchStatements.has(n)) {
              const matchStmt = createMatchStatement(n);

              nodeMatchStatements.set(n, matchStmt as MatchStatement<"NODE">);
            }
          });
        }

        return;
      }

      if (!nodeMatchStatements.has(entity)) {
        const matchStmt = createMatchStatement(entity as Node);

        nodeMatchStatements.set(entity, matchStmt as MatchStatement<"NODE">);
      }
    });

    nodeMatchStatements.forEach((matchStmt, entity) => {
      const match = `MATCH (${entity.name}:${entity.labels.join(":")})`;
      let where: string | undefined = undefined;
      let params: any = {};

      if (matchStmt.where) {
        where = `WHERE ${matchStmt.where.predicates.join(" AND ")}`;
        params = { ...params, ...(matchStmt.where.args || {}) };
      }

      results.params = { ...results.params, ...params };
      results.strs = [...results.strs, match, ...(where ? [where] : [])];
    });

    relationshipMatchStatements.forEach((matchStmt, entity) => {
      const fromNode = `(${entity.from.name})`;
      const toNode = `(${entity.to.name})`;

      const relStr = `[${entity.name}:${entity.label}]`;

      const match = `MATCH ${fromNode}-${relStr}->${toNode}`;

      let where: string | undefined = undefined;
      let params: any = {};

      if (matchStmt.where) {
        where = `WHERE ${matchStmt.where.predicates.join(" AND ")}`;
        params = { ...params, ...(matchStmt.where.args || {}) };
      }

      results.params = { ...results.params, ...params };
      results.strs = [...results.strs, match, ...(where ? [where] : [])];
    });

    results.strs.push(`RETURN ${returnNames.join(", ")}`);
  }

  return [results.strs.join("\n"), results.params];
}

export default toCypher;
