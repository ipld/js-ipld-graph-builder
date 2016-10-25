# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/merkle-trie.svg?style=flat-square)](https://www.npmjs.org/package/merkle-trie)
[![Build Status](https://img.shields.io/travis/wanderer/merkle-trie.svg?branch=master&style=flat-square)](https://travis-ci.org/wanderer/merkle-trie)
[![Coverage Status](https://img.shields.io/coveralls/wanderer/merkle-trie.svg?style=flat-square)](https://coveralls.io/r/wanderer/merkle-trie)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  

A merkle trie implemention that if focused on being generic and fast

# INSTALL
`npm install merkle-trie`

# USAGE

```javascript
  const Vertex = require('merkle-trie')
  const Store = require('merkle-trie/store.js')
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  newVertex.set(path, new Vertex({value: value}))
  newVertex.get(path)
  .then(vertex => {
    // retrieves the vertex that was stored
    newVertex.del(path)
  })
  .flush(link => {
    // saves all the work done on the trie to the store
    // and return the merkle link to the root vertex
  })
```

# TESTS
`npm run tests`

# API
[./docs/](./docs/index.md)

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
