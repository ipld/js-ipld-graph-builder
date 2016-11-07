const tape = require('tape')
const Vertex = require('../')
const Store = require('../store.js')
const Cache = require('../cache.js')
const multicodec = require('multicodec')

tape('basic set, get, del', async t => {
  const store = new Store(undefined, Vertex)
  const newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  newVertex.set(path, new Vertex({value: value}))

  let vertex = await newVertex.get(path)
  t.equals(vertex.value, value, 'basic set and get')
  newVertex.del(path)

  try {
    await newVertex.get(path)
  } catch (err) {
    t.equals(err.message, 'no vertex was found', 'deletes should work')
    newVertex.set(path.concat(['last']), new Vertex({value: value}))
  }

  vertex = await newVertex.get(path)
  t.equals(vertex.isEmpty, true, 'should return a empty vertex if a new vertex saved after an old one was deleted')

  let link = await newVertex.flush()
  vertex = await store.getCID(link)
  vertex = await vertex.get(path.concat(['last']))
  t.equals(vertex.value, value, 'retieve through storage should work')
  t.end()
})

tape('cached opertions', async t => {
  const store = new Store()
  const newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  newVertex.set(path, new Vertex({value: value}))
  newVertex.set(path.slice(0, 2), new Vertex({
    value: 'are choosen'
  }))

  await newVertex.flush(path)
  newVertex.set(path, new Vertex({value: value}))

  let vertex = await newVertex.get(path.slice(0, 2))
  t.equals(vertex.value, 'are choosen', 'should fetch correct vertex')

  t.end()
})

tape('update', async t => {
  const store = new Store()
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  let [vertex, resolve] = await newVertex.update(path)
  t.equals(vertex.isEmpty, true, 'should return a empty vertex')
  t.true(vertex.root === newVertex, 'should have correct root')
  resolve(new Vertex({value: value}));

  [vertex, resolve] = await newVertex.update(path)
  t.equals(vertex.value, value, 'should return the updated vertex')
  newVertex.del(path);

  [vertex, resolve] = await newVertex.update(path)
  resolve(new Vertex({value: value}))

  vertex = await newVertex.get(path)
  t.equals(vertex.value, value, 'should return the updated vertex after a delete')
  t.end()
})

tape('copy', async t => {
  const store = new Store()
  let newVertex = new Vertex({store: store})
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does not glitter'

  const copy = newVertex.copy()
  copy.set(path, new Vertex({value: value}))
  const vertex = await copy.get(path)
  t.equals(vertex.value, value, 'should store a value')

  try {
    await newVertex.get(path)
  } catch (err) {
    t.equals(err.message, 'no vertex was found', 'original should not find a vertex')
    t.end()
  }
})

tape('hashes and serializtion', async t => {
  let vertex = new Vertex()
  let value = 'value'

  vertex.value = value
  let buffer = await vertex.serialize()
  let vertex2 = await Vertex.deserialize(buffer)
  t.equals(value, vertex2.value, 'should equal serialized version')

  let hash = await vertex.hash()
  let hash2 = await vertex2.hash()
  t.equals(hash.buffer.toString('hex'), hash2.buffer.toString('hex'), 'hashes should be equal')
  const circleVal = {edges: new Map(), value: null}
  circleVal.value = circleVal
  try {
    await Vertex.serialize(circleVal)
  } catch (err) {
    t.true(err, 'should have an error if invalid data stuct')
  }

  try {
    await Vertex.deserialize(multicodec.addPrefix('cbor', new Buffer([33, 22])))
  } catch (err) {
    t.true(err, 'should have an error if invalid data stuct')
    t.end()
  }
})

tape('store', async t => {
  const store = new Store(undefined, Vertex)
  let cache = new Cache()
  const path = ['a', 'b', 'c']
  const value = 's0me vaule'
  let rootVertex
  cache.set(path, new Vertex({value: value}))

  try {
    await store.getPath(new Vertex(), path)
  } catch (err) {
    t.ok(err, 'shoulnt get path')
  }
  let cid = await store.batch(cache)
  rootVertex = await store.getCID(cid)
  t.true(rootVertex.edges.get('a'), 'should return the root Vertex')

  let vertex = await store.getPath(rootVertex, path)
  t.equals(vertex.value, value, 'store should retieve vaules')
  cache.del(path)

  cid = await store.batch(cache)
  t.equals(cid, false, 'trie should be empty')

  try {
    await store.getPath(cache.vertex, path)
  } catch (err) {
    t.equals(err.message, 'no vertex was found', 'shoulnt get path')
  }

  rootVertex.del(path)
  rootVertex.set(path.concat(['last']), new Vertex({value: 'a new value'}))
  await rootVertex.flush()

  vertex = await rootVertex.get(path.concat(['last']))
  t.equals(vertex.value, 'a new value', 'cache should write intemerdiary del nodes')

  vertex = await rootVertex.get(path)
  t.equals(vertex.value, undefined, 'cache should still delete intemerdiary nodes')
  t.end()
})

tape('streams', async t => {
  const path = ['not', 'all', 'those', 'who', 'wanderer', 'are', 'lost']
  const path2 = ['all', 'those', 'who', 'wanderer', 'are', 'lost']
  const value = 'all that is gold does glitter'
  const store = new Store()
  let newVertex = new Vertex({store: store})
  let leafNum = 0

  newVertex.set(path, new Vertex({value: value}))
  newVertex.set(path2, new Vertex({value: value}))
  const cid = await newVertex.flush()
  let readStream = store.createReadStream(cid)
  readStream.on('data', vertex => {
    if (vertex.isLeaf) {
      leafNum++
    }
  })
  readStream.on('end', () => {
    t.equals(leafNum, 2, 'should stream all the leafs')
    t.end()
  })
})
