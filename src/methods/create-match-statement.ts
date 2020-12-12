import { Relationship, Node } from "../classes";
import { MatchStatement } from "../types";

function createMatchStatement(entity: Node | Relationship): MatchStatement {
  if (entity instanceof Node) {
    const matchStmt: MatchStatement<"NODE"> = {
      type: "NODE",
      variable: entity.name,
    };

    if (entity.whereArgs && entity.wherePredicates) {
      matchStmt.where = {
        args: entity.whereArgs,
        predicates: entity.wherePredicates,
      };
    }

    return matchStmt;
  }

  const matchStmt: MatchStatement<"RELATIONSHIP"> = {
    type: "RELATIONSHIP",
    variable: entity.name,
  };

  return matchStmt;
}

export default createMatchStatement;
