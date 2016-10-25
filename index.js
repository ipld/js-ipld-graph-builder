const ipld = require('ipld')
const multicodec = require('multicodec')
const CacheVertex = require('./cache.js')
const Link = require('./link.js')

module.exports = class Vertex {
  /**
   * Create a new vertex
   * @param {*} value the value that the vertex holds
   * @param {Map} edges the edges that this vertex has stored a `Map` edge name => `Vertex`
   */
  constructor (opts = {}) {
    this.value = opts.value
    this.edges = opts.edges || new Map()
    this._store = opts.store
    this._cache = opts.cache || new CacheVertex()
    this._cache.vertex = this
  }

  // returns new state root hash
  toBuffer () {
    return Vertex.toBuffer(this)
  }

  static toBuffer (vertex) {
    const edges = [...vertex.edges].map(item => {
      item[1] = item[1].toBuffer()
      return item
    })
    return multicodec.addPrefix('cbor', ipld.marshal({value: vertex.value, edges: edges}))
  }

  hash () {
    return Vertex.toBuffer(this)
  }

  static hash (data) {
    return ipld.multihash(data)
  }

  static fromBuffer (data) {
    // to do handle externtions
    let {value, edges} = ipld.unmarshal(multicodec.rmPrefix(data))
    edges = edges.map(([name, link]) => {
      return [name, new Link(link)]
    })
    return new Vertex({
      value: value,
      edges: new Map(edges)
    })
  }

  /**
   * @property {boolean} Returns truthy on whether the vertexs is empty
   */
  get isEmpty () {
    return !this.edges.size && (this.value === undefined || this.value === null)
  }

  /**
   * @property {boolean} isLeaf wether or not the current vertex is a leaf
   */
  get isLeaf () {
    return this.edges.size === 0
  }

  //
  set (path, newVertex) {
    this._cache.update(path, vertex => {
      vertex.value = {
        op: 'set',
        vertex: newVertex
      }

      newVertex._cache = vertex
      return vertex
    })
  }

  //
  del (path) {
    this._cache.del(path)
  }

  //
  get (path) {
    return new Promise((resolve, reject) => {
      // check the cache first
      const cachedVertex = this._cache.get(path)
      if (!cachedVertex || cachedVertex.isEmpty) {
        // get the value from the store
        this._store.get(this, path).then(resolve, reject)
      } else if (cachedVertex.op === 'del') {
        if (cachedVertex.isLeaf) {
          reject('no vertex was found')
        } else {
          cachedVertex.vertex = new Vertex()
          resolve(cachedVertex.vertex)
        }
        // the value is marked for deletion
      } else {
        // return the cached value
        const vertex = cachedVertex.vertex
        resolve(vertex)
      }
    })
  }

  update (path) {
    // checks the cache first
    return new Promise(resolve => {
      this._cache.updateAsync(path, (cachedVertex, updateCacheFn) => {
        let vertex = cachedVertex.vertex
        if (cachedVertex.op === 'del') {
          vertex = new Vertex({store: this._store})
        }

        if (vertex) {
          onVertexFound(vertex)
        } else {
          // if there is no vertex found in the cache
          this._store.get(this, path)
            .then(onVertexFound)
            .catch(() => {
              onVertexFound(new Vertex({store: this._store}))
            })
        }

        function onVertexFound (vertex) {
          resolve([vertex, updatedVertex => {
            updateCacheFn(updatedVertex._cache)
          }])
        }
      })
    })
  }

  // saves work to store
  flush () {
    return this._store.batch(this._cache)
  }

  copy () {
    const cache = this._cache.copy()
    return new Vertex({
      value: this.value,
      edges: this.edges,
      store: this._store,
      cache: cache
    })
  }
}
