const CacheVertex = require('imperative-trie')
const Levelup = require('level')
const Link = require('./link.js')
const Readable = require('./readStream.js')

const Vertex = module.exports = class Vertex {
  /**
   * Create a new vertex
   * @param {*} value the value that the vertex holds
   * @param {Map} edges the edges that this vertex has stored a `Map` edge name => `Vertex`
   */
  constructor (value, edges = new Map(), store = new Levelup('', {db: require('memdown')}), cache = new CacheVertex()) {
    this._value = value
    this._edges = edges
    this._store = store
    this._cache = cache
  }

  static fromBuffer (data) {
    return new Vertex()
  }

  toBuffer () {
    return this
  }

  static resolveVertex (store, link, decoders = Vertex.decoders) {
    return new Promise((resolve, reject) => {
      store.get(link.hash, (val, err) => {
        if (val) {
          const type = val[0]
          resolve(decoders[type](val))
        } else {
          reject(err)
        }
      })
    })
  }

  /**
   * @property {*} value the value of the vertex
   */
  get value () {
    return this._value
  }

  /**
   * @property {*} the edges of the vertex
   */
  get edges () {
    return this._edges
  }

  /**
   * @property {Vertex} returns the root vertex
   */
  get root () {
    let vertex = this
    while (vertex._parent) {
      vertex = vertex._parent
    }
    return vertex
  }

  /**
   * @property {boolean} Returns truthy on whether the vertexs is empty
   */
  get isEmpty () {
    return this._edges.size === 0 && this._value === undefined
  }

  // returns new trie
  set (path, newVertex) {
    const value = {
      op: 'set',
      value: newVertex
    }

    const opVertex = this._cache.get(path)
    if (opVertex) {
      opVertex.value = value
    } else {
      this._cache.set(path, new CacheVertex(value))
    }
  }

  // returns new trie
  del (path) {
    this._cache.set(path, new CacheVertex({
      op: 'del'
    }))
  }

  get (path) {
    return new Promise((resolve, reject) => {
      const cachedVertex = this._cache.get(path)
      if (!cachedVertex || cachedVertex.isEmpty) {
        // get the value from the store
        this._getFromStore(path, foundVertex => {
          if (cachedVertex) {
            foundVertex._cache = cachedVertex
          }
          resolve(cachedVertex)
        }, reject)
      } else if (vertex.value.op === 'del') {
        // the value is marked for deletion
        resolve()
      } else {
        // return the cached value
        const vertex = cachedVertex.value.value
        vertex._cache = cachedVertex
        resolve(vertex)
      }
    })
  }

  _getFromStore (path, resolve, reject) {
    const label = path.shift()
    const edge = this._edges[label]
    if (edge) {
      if (edge instanceof Link) {
        Vertex.resolveVertex(this.store, edge).then(vertex => {
          onVertexFound(label, edge)
        }, reject)
      } else {
        onVertexFound(label, edge)
      }
    } else {
      resolve()
    }

    // runs when a vertex is found.
    function onVertexFound (label, vertex) {
      if (path.length) {
        vertex._getFromStore(path, resolve, reject, onVertex)
      } else {
        resolve(vertex)
      }
    }
  }

  // returns new state root hash
  hash () {
  }
  // saves work to store
  flush () {
    return new Promise((resolve, reject) => {
      for (let [, {op, vertex}] in this._cache) {
        if (op === 'put') {
          const hash = vertex.hash()
          this.store.put(hash, vertex)
        }
      }
    })
  }
  // returns a stream
  createReadStream (path) {
    return new Readable(this.copy())
  }

  copy () {
    return new Vertex(this.value, this.edges, this._store, this._cache)
  }
}

Vertex.decorder = {
  0x0: Vertex.fromBuffer
}

// vertex = state.get(path)
// vertex.update(path, val)
// vertex.getRoot()
