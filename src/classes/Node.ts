export interface NodeConstructor {
  name: string;
  labels: string[];
}

class Node {
  public wherePredicates?: string[];
  public whereArgs?: any;
  public name: string;
  public labels: string[];
  public type: "MATCH" | "CREATE";
  public used?: boolean;

  constructor(input: NodeConstructor) {
    this.name = input.name;
    this.labels = input.labels || [];
    this.type = "MATCH";
  }

  where(obj: any): Node {
    const { predicates, args } = Object.entries(obj).reduce(
      (res: { predicates: string[]; args: any }, [key, value]) => {
        const varName = `${this.name}_${key}`;

        res.predicates.push(`${this.name}.${key} = $${varName}`);
        res.args = { ...res.args, [varName]: value };

        return res;
      },
      {
        predicates: [],
        args: {},
      }
    ) as { predicates: string[]; args: any };

    if (!this.wherePredicates) {
      this.wherePredicates = [];
    }

    if (!this.whereArgs) {
      this.whereArgs = {};
    }

    this.wherePredicates = [...this.wherePredicates, predicates.join(" AND ")];

    this.whereArgs = { ...this.whereArgs, ...args };

    return this;
  }
}

export default Node;
