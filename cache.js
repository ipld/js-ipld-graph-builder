const Vertex = require('imperative-trie')

module.exports = class CacheVertex extends Vertex {
  constructor (op, vertex, edge) {
    super({
      op: op,
      vertex: vertex
    })
    this.waitingWrites = []
  }

  get hasVertex () {
    return this.op === 'del' || this.vertex
  }

  get op () {
    return this.value.op
  }

  set op (op) {
    this.value.op = op
  }

  get vertex () {
    return this.value.vertex
  }

  set vertex (vertex) {
    this.value.vertex = vertex
  }

  set (path, vertex) {
    super.set(path, new CacheVertex('set', vertex))
  }

  del (path) {
    super.set(path, new CacheVertex('del'))
  }

  clear () {
    this.op = null
    this.edges = new Map()
  }
}
