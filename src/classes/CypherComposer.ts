import Node from "./Node";

class CypherComposer {
  private nodes: Node[];
  private returns?: Node[];

  constructor() {
    this.nodes = [];
  }

  node(name: string, label?: string | string[]): Node;
  node(name: string, label: string | string[]): Node {
    const node = new Node({
      name,
      labels: label ? (Array.isArray(label) ? label : [label]) : [],
    });

    this.nodes.push(node);

    return node;
  }

  return(node: Node): CypherComposer {
    if (!this.returns) {
      this.returns = [];
    }

    node.used = true;
    this.returns.push(node);

    return this;
  }

  toCypher(): [string, any] {
    const toMatch = this.nodes.filter((x) => x.type === "MATCH" && x.used);

    interface Res {
      strs: string[];
      params: any;
    }

    const results: Res = { strs: [], params: {} };

    const matchAndParams = toMatch.reduce(
      (res: Res, node) => {
        res.strs.push(`MATCH (${node.name}:${node.labels.join(":")})`);

        if (node.wherePredicates?.length) {
          res.strs.push(`WHERE ${node.wherePredicates.join(" ")}`);
          res.params = { ...res.params, ...(node.whereArgs || {}) };
        }

        return res;
      },
      {
        strs: [],
        params: {},
      }
    ) as Res;

    results.strs = [...results.strs, matchAndParams.strs.join("\n")];
    results.params = { ...results.params, ...matchAndParams.params };

    if (this.returns?.length) {
      const returnNames = this.returns.map((x) => x.name);

      results.strs.push(`RETURN ${returnNames.join(", ")}`);
    }

    return [results.strs.join("\n"), results.params];
  }
}

export default CypherComposer;
