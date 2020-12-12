import { Relationship, Node } from "../classes";
import { MatchStatement } from "../types";

function createMatchStatement(entity: Node | Relationship): MatchStatement {
  if (entity instanceof Relationship) {
    const fromNode = `(${entity.from.name})`;
    const toNode = `(${entity.to.name})`;
    const relStr = `[${entity.name}:${entity.label}]`;
    const match = `MATCH ${fromNode}-${relStr}->${toNode}`;

    return {
      args: {},
      str: match,
    };
  }

  const match = `MATCH (${entity.name}:${entity.labels.join(":")})`;
  let where: string | undefined = undefined;
  let params: any = {};

  if (entity.wherePredicates?.length) {
    where = `WHERE ${entity.wherePredicates.join(" AND ")}`;
    params = { ...params, ...(entity.whereArgs || {}) };
  }

  return {
    args: params,
    str: `${match}${where ? `\n${where}` : ""}`,
  };
}

export default createMatchStatement;
