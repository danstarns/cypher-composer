import { Node } from "./classes";

export interface MatchStatement {
  str: string;
  args: any;
}

export interface CreateStatement {
  str: string;
  args: any;
}

export interface CreateOperation {
  kind: "CREATE";
  entity: Node;
}
