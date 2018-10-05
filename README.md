# SYNOPSIS 
[![NPM Package](https://img.shields.io/npm/v/ipld-graph-builder.svg?style=flat-square)](https://www.npmjs.org/package/ipld-graph-builder)
[![Coverage Status](https://img.shields.io/coveralls/ipld/js-ipld-graph-builder.svg?style=flat-square)](https://coveralls.io/r/ipld/js-ipld-graph-builder)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard) [![Greenkeeper badge](https://badges.greenkeeper.io/ipld/js-ipld-graph-builder.svg)](https://greenkeeper.io/)  

This provides an efficent way to build and manipulate IPLD DAGs as JSON. This is accomplished by only producing merkle roots when `flush`ing the DAG. If any object has a "/" property, its value will be replaced with the merkle hash of that value when flushed. This allows you to build object anyway you like. 

# LEAD MAINTAINER

[wanderer](https://github.com/wanderer)

# INSTALL
`npm install ipld-graph-builder`

# USAGE

```javascript
const IPFS = require('ipfs')
const Graph = require('ipld-graph-builder')
const ipfs = new IPFS()

ipfs.on('start', () => {
  const graph = new Graph(ipfs.dag)
  const a = {
    some: {
      thing: 'nested'
    }
  }
  const b = {
    lol: 1
  }

  graph.set(a, 'some/thing/else', b).then(result => {
    // set "patches" together two objects
    console.log(JSON.stringify(result))
    > {
    >  "some": {
    >    "thing": {
    >      "else": {
    >        "/": {
    >          "lol": 1
    >        }
    >      }
    >    }
    >  }
    >}


    // flush replaces the links with merkle links, resulting in a single root hash
    graph.flush(result).then((result) => {
      console.log(result)
      > { '/': 'zdpuAqnGt7k49xSfawetvZXSLm4b1vvkSMnDrk4NFqnCCnW5V' }

      // taverse paths through merkle links given a starting vertex
      graph.get(result, 'some/thing/else').then(result2 => {
        console.log(result2)
        > { lol: 1 }
      })
    })
  })
})
```
Additonally you can define the encoding of each link by adding the follow `options` property to un-merklized links. `options` will be used as the options argument for [`DAG.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput). For Example:
```
{
  'my-link': {
    '/': {
      'some': 'stuff here'
    },
    'options': {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
     }
  }
}
```

# API
['./docs/'](./docs/index.md)

# TESTS
`npm run tests`

# LICENSE
[MPL-2.0](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2))
