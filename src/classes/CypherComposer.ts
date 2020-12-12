import Node from "./Node";
import Relationship, { RelationshipConstructor } from "./Relationship";
import * as methods from "../methods";

class CypherComposer {
  public nodes: Node[];
  public returns?: (Node | Relationship)[];
  public relationships: Relationship[];

  constructor() {
    this.nodes = [];
    this.relationships = [];
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

  relationship(input: string): Relationship | undefined;
  relationship(input: RelationshipConstructor): Relationship;
  relationship(
    input: string | RelationshipConstructor
  ): Relationship | undefined {
    if (typeof input === "string") {
      return this.relationships.find((x) => x.name === input);
    }

    const relationship = new Relationship(input);

    return relationship;
  }

  return(value: Node | Relationship | (Node | Relationship)[]): CypherComposer {
    if (!this.returns) {
      this.returns = [];
    }

    let values: (Node | Relationship)[] = [];

    if (Array.isArray(value)) {
      values = value;
    } else {
      values = [value];
    }

    values.forEach((v) => {
      v.used = true;
      (this.returns as any[]).push(v);
    });

    return this;
  }

  toCypher(): [string, any] {
    return methods.toCypher(this);
  }
}

export default CypherComposer;
