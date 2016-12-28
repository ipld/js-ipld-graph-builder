# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/merkle-trie.svg?style=flat-square)](https://www.npmjs.org/package/merkle-trie)
[![Build Status](https://img.shields.io/travis/wanderer/merkle-trie.svg?branch=master&style=flat-square)](https://travis-ci.org/wanderer/merkle-trie)
[![Coverage Status](https://img.shields.io/coveralls/wanderer/merkle-trie.svg?style=flat-square)](https://coveralls.io/r/wanderer/merkle-trie)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  

A merkle trie implemention that if focused on being generic and fast backed by IPFS

# INSTALL
`npm install merkle-trie`

# USAGE

```javascript
const store = new Store()
const newVertex = new Vertex({
  store: store
})
const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
const value = 'all that is gold does not glitter'

newVertex.set(path, new Vertex({
  value: value
}))

newVertex.get(path)
.then(vertex => {
  // retrieves the vertex that was stored
  // saves all the work done on the trie to the store
  // and return the merkle link to the root vertex
  return newVertex.flush()
}).then(cid => {
  // get the vertex from the store
  return store.get(cid)
}).then(vertex => {
  // the vertex returned from the store
  return vertex.get(path)
}).then(vertex => {
  console.log(vertex.value) // all that is gold does not glitter
})
```
# NOTES
Operations that mutate the trie (set and delete) are synchronous while operations
that return values (get, update) are asynchronous. This is because writing
operations are written to a cache. And the cache is only written to the
store when `flush` is called. The idea here is to avoid doing lookups and
hashing until it is absolutely necessary.

Store is just a instance of [ipld-resolver](https://github.com/ipld/js-ipld-resolver)
that uses promises instead of callbacks.


# API
 - [Vertex](./docs/Vertex.md)  
 - [Store](./docs/Store.md)

# TESTS
`npm run tests`

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
