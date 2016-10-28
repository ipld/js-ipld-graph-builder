'use strict'
const tape = require('tape')
const Vertex = require('../')
const Store = require('../store.js')
const Cache = require('../cache.js')
const Link = require('../link.js')

tape('basic set, get, del', t => {
  const store = new Store()
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  newVertex.set(path, new Vertex({value: value}))
  let promise = newVertex.get(path)

  promise.then(vertex => {
    t.equals(vertex.value, value, 'basic set and get')
    newVertex.del(path)
    return newVertex.get(path)
  })
  .catch(err => {
    t.equals(err, 'no vertex was found', 'deletes should work')
    newVertex.set(path.concat(['last']), new Vertex({value: value}))
    return newVertex.get(path)
  })
  .then((vertex) => {
    t.equals(vertex.isEmpty, true, 'should return a empty vertex if a new vertex saved after an old one was deleted')
    return newVertex.flush()
  })
  .then(link => {
    return store.getLink(link)
  })
  .then(vertex => {
    return vertex.get(path.concat(['last']))
  }).then(vertex => {
    t.equals(vertex.value, value, 'retieve through storage should work')
    t.end()
  }).catch(err => {
    console.log(err)
  })
})

tape('update', t => {
  const store = new Store()
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  newVertex.update(path).then(([vertex, resolve]) => {
    t.equals(vertex.isEmpty, true, 'should return a empty vertex')
    resolve(new Vertex({value: value}))
  }).then(() => {
    return newVertex.update(path)
  }).then(([vertex, resolve]) => {
    t.equals(vertex.value, value, 'should return the updated vertex')
    newVertex.del(path)
    return newVertex.update(path)
  }).then(([vertex, resolve]) => {
    resolve(new Vertex({value: value}))
    return newVertex.get(path)
  }).then(vertex => {
    t.equals(vertex.value, value, 'should return the updated vertex after a delete')
    t.end()
  })
})

tape('copy', t => {
  const store = new Store()
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  const copy = newVertex.copy()
  copy.set(path, new Vertex({value: value}))
  copy.get(path)
    .then(vertex => {
      t.equals(vertex.value, value, 'should store a value')
      return newVertex.get(path)
    })
    .catch(err => {
      t.equals(err, 'no vertex was found', 'original should not find a vertex')
      t.end()
    })
})

tape('hashes and serializtion', t => {
  let vertex = new Vertex()
  let value = 'value'
  let hash

  vertex.value = value
  vertex.hash().then(h => {
    hash = h
    return vertex.serialize()
  }).then(buffer => {
    return Vertex.unserialize(buffer)
  }).then(vertex2 => {
    t.equals(value, vertex2.value, 'should equal serialized version')
    return vertex2.hash()
  }).then(hash2 => {
    t.equals(hash.toString('hex'), hash2.toString('hex'), 'hashes should be equal')
    t.end()
  })
})

tape('store', t => {
  const store = new Store()
  let cache = new Cache()
  const path = ['a', 'b', 'c']
  const value = 's0me vaule'
  let rootVertex
  cache.set(path, new Vertex({value: value}))

  store.getLink(new Link('invalid link'))
  .catch(error => {
    t.ok(error, 'should generate an error for non-existant links')
    return store.get(new Vertex(), path)
  })
  .catch(err => {
    t.ok(err, 'shoulnt get path')
  })
  .then(() => {
    return store.batch(cache)
  })
  .then(link => {
    return store.getLink(link)
  })
  .then(vertex => {
    rootVertex = vertex
    t.true(vertex.edges.get('a') instanceof Link, 'should return the root Vertex')
    return store.get(vertex, path)
  })
  .then(vertex => {
    t.equals(vertex.value, value, 'store should retieve vaules')
    cache.del(path)
    return store.batch(cache)
  })
  .then((link) => {
    t.equals(link, false, 'trie should be empty')
    return store.get(cache.vertex, path)
  }).catch(err => {
    t.equals(err, 'no vertex was found', 'shoulnt get path')

    rootVertex.del(path)
    rootVertex.set(path.concat(['last']), new Vertex({value: 'a new value'}))
    return rootVertex.flush()
  }).then(() => {
    return rootVertex.get(path.concat(['last']))
  }).then(vertex => {
    t.equals(vertex.value, 'a new value', 'cache should write intemerdiary del nodes')
    return rootVertex.get(path)
  }).then(vertex => {
    t.equals(vertex.value, undefined, 'cache should still delete intemerdiary nodes')
    t.end()
  })
  .catch(err => {
    console.log(err)
  })
})

tape('streams', t => {
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const path2 = ['all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does glitter'
  const store = new Store()
  let newVertex = new Vertex({store: store})
  let leafNum = 0

  newVertex.set(path, new Vertex({value: value}))
  newVertex.set(path2, new Vertex({value: value}))
  newVertex.flush().then(link => {
    let readStream = store.createReadStream(link)
    readStream.on('data', vertex => {
      if (vertex.isLeaf) {
        leafNum++
      }
    })
    readStream.on('end', () => {
      t.equals(leafNum, 2, 'should stream all the leafs')
      t.end()
    })
  }).catch(err => console.log(err))
})
