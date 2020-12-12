import Node from "./Node";

export interface RelationshipConstructor {
  from: Node;
  to: Node;
  label: string;
  name: string;
}

class Relationship {
  public from: Node;
  public to: Node;
  public label: string;
  public name: string;
  used?: boolean;

  constructor(input: RelationshipConstructor) {
    this.from = input.from;
    this.to = input.to;
    this.label = input.label;
    this.name = input.name;
  }
}

export default Relationship;
