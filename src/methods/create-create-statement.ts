import { Node } from "../classes";
import { CreateStatement } from "../types";

function createCreateStatement({
  entity,
  chainStr,
}: {
  entity: Node;
  chainStr?: string;
}): CreateStatement {
  const stmt = `CREATE (${entity.name}:${entity.labels.join(":")})`;

  const { sets, args } = Object.entries(entity.properties || {}).reduce(
    (res: { sets: string[]; args: any }, entry) => {
      let paramName = "";

      if (chainStr) {
        paramName = `${chainStr}_${entity.name}_${entry[0]}`;
      } else {
        paramName = `${entity.name}_${entry[0]}`;
      }

      res.args[paramName] = entry[1];
      res.sets.push(`SET ${entity.name}.${entry[0]} = $${paramName}`);
      return res;
    },
    { sets: [], args: {} }
  ) as { sets: string[]; args: any };

  return {
    str: [stmt, ...sets].join("\n"),
    args,
  };
}

export default createCreateStatement;
