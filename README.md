# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/ipld-graph-builder.svg?style=flat-square)](https://www.npmjs.org/package/ipld-graph-builder)
[![Build Status](https://img.shields.io/travis/ipld/js-ipld-graph-builder.svg?branch=master&style=flat-square)](https://travis-ci.org/ipld/js-ipld-graph-builder)
[![Coverage Status](https://img.shields.io/coveralls/ipld/js-ipld-graph-builder.svg?style=flat-square)](https://coveralls.io/r/ipld/js-ipld-graph-builder)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)  

This provides an efficent way to build and manipulate IPLD DAGs as JSON. This is accomplished by only producing merkle roots when `flush`ing the DAG. If any object has a "/" property, its value will be replaces with merlke has of that value when flushed. This allows you to build object anyway you like. 

# INSTALL
`npm install ipld-graph-builder`

# USAGE

```javascript
const IPFS = require('ipfs')
const Graph = require('../')
const ipfs = new IPFS()

node.on('start', () => {
  const graph = new Graph(ipfs.dag)
  const a = {
    'some': {
      thing: 'nested'
    }
  }
  const b = {
    lol: 1
  }

  graph.set(a, 'some/thing/else', b).then(result => {
      // set "patches" together two objects
      console.log(result)
      > 'some': {
      >   'thing': {
      >     'else': {
      >       '/': {
      >         'lol': 1
      >       }
      >     }
      >   }
      > }

      // flush replaces the links with merkle links
      graph.flush(result).then(cid => {
        console.log(result)
        > 'some': {
        >   'thing': {
        >     'else': {
        >       '/': 'zdpuAtQW2gsryPptovnqM7vweN5Jk9iEssJbfMKWY7F1eyh8j'
        >     }
        >   }
        > }
      })
  })
}


```
# API
['./docs/']('./docs')

# TESTS
`npm run tests`

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
