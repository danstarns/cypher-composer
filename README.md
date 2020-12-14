# cypher-composer
> Proof on concept 🚧🏗

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

This implementation keeps things simple by using only exposing 2 concepts `Node` and `Relationship` where you stick each together like pieces of lego. In the background, while your composing Cypher, a virtual COM(Cypher Object Model) is manipulated & finally complied when `.toCypher` is called. Using the COM is what allows users of the composer to not worry about keeping track of variables, scopes and the sequence of operations... What this means is that users don't have to work with Cypher languages nuances such as `WITH` thus making the library feel 'lucid'. Before 'compiling' the COM into cypher `cypher-composer` will look at all the operations you have called and return optimal cypher.

Using the composer allows Users to interact with some 'pre made' common 'workflows' such as; 

1. create
2. update
3. connect
4. disconnect
5. delete

## Getting Started
### Installing
```
$ npm install cypher-composer
```

### Quick Start

```js
const CypherComposer = require("cypher-composer");
const composer = new CypherComposer();

const user = composer
    .node({ 
        name: "user",
        label: "User",
        properties: { name: "Dan" }
    });

const group = composer
    .node("group", "Group")
    .where({ name: "beer-group" });

const hasGroup = composer
    .relationship({
        from: node,
        to: group,
        label: "HAS_GROUP",
        properties: { joined: new Date() }
    });

composer.create(user);
node.connect(hasGroup);

const [cypher] = composer.toCypher();
console.log(cypher);
// CREATE (user:User {name: "Dan"})
// WITH user
// MATCH (group:Group)
// WHERE group.name = "beer-group"
// MERGE (user)-[:HAS_GROUP {joined: "date"}]->(group)
```

## Matching

### Matching a node
```js
const composer = new CypherComposer();

const group = composer
    .node("group", "Group")
    .where({ name: "beer-group" });

composer.return(group);

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (group:Group)
// WHERE group.name = "beer-group"
// RETURN group
```

### Matching a node thru a relationship

```js
const composer = new CypherComposer();

const user = composer
    .node("user", "User")
    .where({ id: "some id" });

const group = user
    .thru(
        composer.relationship({
            from: user,
            to: composer.node("group", "Group"),
            label: "HAS_GROUP"
        })
    );

composer.return(group);

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User)
// WHERE user.id = "some id"
// MATCH (user)-[:HAS_GROUP]->(group:Group)
// RETURN group
```

### Matching a relationship

```js
const composer = new CypherComposer();

const user = composer.node("user", "User");

const group = composer.node("group", "Group");

const hasGroup =  composer.relationship({
    from: user,
    to: group,
    label: "HAS_GROUP",
    name: "hasGroup"
});

composer.return(hasGroup);

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User)
// MATCH (group:Group)
// MATCH (user)-[hasGroup:HAS_GROUP]->(group:Group)
// RETURN hasGroup
```

## Creating

### Creating a node
```js
const composer = new CypherComposer();

const node = composer.create(
  composer.node("user", "User", { name: "dan" })
);

composer.return(node);

const [cypher] = composer.toCypher();
console.log(cypher);
// CREATE (user:User {name: "dan"})
// RETURN user
```

### Creating a relationship
```js
const composer = new CypherComposer();

const user = composer
    .node({ 
        name: "user",
        label: "User",
        properties: { name: "Dan" }
    });

const group = composer
    .node("group", "Group")
    .where({ name: "beer-group" });

const hasGroup = composer
    .relationship({
        from: node,
        to: group,
        label: "HAS_GROUP",
        properties: { joined: new Date() }
    });

composer.create(user);
node.connect(hasGroup);

const [cypher] = composer.toCypher();
console.log(cypher);
// CREATE (user:User {name: "Dan"})
// MATCH (group:Group {name: "beer-group"})
// MERGE (user)-[:HAS_GROUP {joined: "date"}]->(group)
```

## Updating

### Updating a node
```js
const composer = new CypherComposer();

const user = composer.node("user", "User", { name: "dan" })

composer.update(user, { properties: { name: "Dan" } })

composer.return(user);

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User {name: "dan"})
// SET user.name = "Dan"
// RETURN user
```

### Updating a relationship
```js
const composer = new CypherComposer();

const user = composer
    .node({ 
        name: "user",
        label: "User",
    })
    .where({ name: "Dan" });

const group = composer
    .node("group", "Group")
    .where({ name: "beer-group" });

const hasGroup = composer
    .relationship({
        from: node,
        to: group,
        label: "HAS_GROUP",
        properties: { joined: new Date() },
        name: "hasGroup"
    });

composer.update(hasGroup, { properties: { joined: new Date() } })

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User {name: "Dan"})
// MATCH (group:Group {name: "beer-group"})
// MATCH (user)-[hasGroup:HAS_GROUP {joined: "date"}]->(group)
// SET hasGroup.joined = "date"
```

## Deleting

### Deleting a node
```js
const composer = new CypherComposer();

const user = composer.node("user", "User", { name: "dan" })

composer.delete(user, { detach: true })

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User {name: "dan"})
// DETACH DELETE user
```

### Deleting a relationship
```js
const composer = new CypherComposer();

const user = composer
    .node({ 
        name: "user",
        label: "User",
    })
    .where({ name: "Dan" });

const group = composer
    .node("group", "Group")
    .where({ name: "beer-group" });

const hasGroup = composer
    .relationship({
        from: node,
        to: group,
        label: "HAS_GROUP",
        properties: { joined: new Date() },
        name: "hasGroup"
    });

composer.disconnect(hasGroup)

const [cypher] = composer.toCypher();
console.log(cypher);
// MATCH (user:User {name: "Dan"})
// MATCH (group:Group {name: "beer-group"})
// MATCH (user)-[hasGroup:HAS_GROUP {joined: "date"}]->(group)
// DELETE hasGroup
```