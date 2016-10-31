const Vertex = require('../')
const Store = require('../store.js')
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
  return store.getCID(cid)
}).then(vertex => {
  // the vertex returned from the store
  return vertex.get(path)
}).then(vertex => {
  console.log(vertex.value) // all that is gold does not glitter
})
