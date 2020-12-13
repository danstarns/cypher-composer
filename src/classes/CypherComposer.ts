import Node from "./Node";
import Relationship, { RelationshipConstructor } from "./Relationship";
import * as methods from "../methods";
import { CreateOperation } from "../types";

class CypherComposer {
  public nodes: Node[];
  public returns?: (Node | Relationship)[];
  public relationships: Relationship[];
  public nameSet: Set<string>;
  public operations: CreateOperation[];

  constructor() {
    this.nodes = [];
    this.relationships = [];
    this.nameSet = new Set();
    this.operations = [];
  }

  create(entity: Node): Node {
    if (entity.whereArgs?.length) {
      throw new Error(`cant create a MATCH node ${entity.name}`);
    }

    const existing = this.operations.find(
      (x) => x.kind === "CREATE" && x.entity === entity
    );

    if (existing) {
      throw new Error(`cant create ${entity.name} twice`);
    }

    this.operations.push({ kind: "CREATE", entity });

    entity.type = "CREATE";

    return entity;
  }

  node(name: string, label?: string | string[], properties?: any): Node {
    if (!label) {
      const existing = this.nodes.find((x) => x.name === name);

      if (existing) {
        return existing;
      }
    }

    if (this.nameSet.has(name)) {
      throw new Error(`duplicate identifier ${name}`);
    }

    const node = new Node({
      name,
      labels: label ? (Array.isArray(label) ? label : [label]) : [],
      properties,
    });

    this.nameSet.add(name);
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

    if (this.nameSet.has(input.name)) {
      throw new Error(`duplicate identifier ${input.name}`);
    }

    const relationship = new Relationship(input);

    this.nameSet.add(input.name);
    this.relationships.push(relationship);

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
