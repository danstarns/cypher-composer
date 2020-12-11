# cypher-composer
Javascript Cypher composer for [Neo4j](https://neo4j.com/).

## Why
You may have heard or even used a `Query Builder` before. When starting out with `cypher-composer` the goal was another Query Builder. Quickly some issues started to unveil themselves & the clearest one being; 

> Most Query Builders add an unnecessary level of abstraction on top of what cypher provides.

Example showing a 1-1 query builder to cypher mapping 
```js
const query = 
   match("user", "User", { active: true })
  .where({ "user.age": greaterThan(18) })
  .return("user");
```

Example showing above generated cypher
```cypher
MATCH (user:User, { active: true })
WHERE user.age > 18
RETURN user
```

If you are using a Query Builder to help you generate cypher queries and then you need to map 1-1 what you would do with cypher is the Query Builder really helping you ? 

Having a 1-1 mapping is forcing users of the library to think about the Query when that should be the responsibility of the 'Query Builder'. Users need to consciously keep track of; variables, scopes and the sequence of operations... again all things that could be presumed as the role of the Query Builder.

## How
Calling this implementation a `Composer` over `Builder` comes with;

1. No need to keep track of variables, scopes and the sequence of operations
2. Exposes real abstractions (connect, disconnect ect ect)

This implementation keeps things simple by using only 2 Classes as the building blocks; `Node` and `Relationship` from here you stick together Nodes and relationships like pieces of lego. In the background, while your composing Cypher, a virtual COM(Cypher Object Model) is manipulated & finally complied when `.toCypher` is called.

Using the COM is what allows users of the composer to no worry about keeping track of variables, scopes and the sequence of operations. The COM is traversed and the Optimal cypher is generated.

## Getting Started
### Installing
```
$ npm install cypher-composer
```

### Quick Start

```js
const CypherComposer = require("cypher-composer");

const composer = new CypherComposer();

const node = composer.create(
    composer.node({
        name: "user", 
        label: "User",
        properties: { name: "Dan" }
    })
);

const group = composer.node("group", "Group").where({ name: "beer-group" });

node.connect(
    composer.relationship({
        from: node,
        to: group,
        label: "HAS_GROUP",
        properties: { joined: new Date() }
    })
);

const cypher = composer.toCypher();

console.log(cypher);
// CREATE (user:User {name: "Dan"})
// WITH user
// MATCH (group:Group)
// WHERE group.name = "beer-group"
// MERGE (user)-[:HAS_GROUP {joined: "date"}]->(group)
```

## Matching
```js
const CypherComposer = require("cypher-composer");

const composer = new CypherComposer();

const group = composer.node("group", "Group").where({ name: "beer-group" });

composer.return(group);

const cypher = composer.toCypher();

console.log(cypher);
// MATCH (group:Group)
// WHERE group.name = "beer-group"
// RETURN group
```

### Matching across relaitonships

```js
const CypherComposer = require("cypher-composer");

const composer = new CypherComposer();

const user = composer.node("user", "User").where({ id: "some id" });

const group = composer.node(
    composer.relationship({
        from: user,
        to: composer.node("group", "Group"),
        label: "HAS_GROUP",
        properties: { joined: new Date() }
    })
);

composer.return(group);

const cypher = composer.toCypher();

console.log(cypher);
// MATCH (group:Group)<-[:HAS_GROUP]-(user:User {id: "some id"})
// RETURN group
```

