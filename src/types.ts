export interface MatchStatement<t = "NODE" | "RELATIONSHIP"> {
  type: t;
  variable: string;
  where?: WhereClause;
}

export interface WhereClause {
  predicates: string[];
  args: any;
}
