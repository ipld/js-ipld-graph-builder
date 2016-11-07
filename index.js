const dagCBOR = require('ipld-dag-cbor')
const CID = require('cids')
const CacheVertex = require('./cache.js')
const Store = require('./store.js')

module.exports = class Vertex {
  /**
   * Create a new vertex
   * @param {Object} opts
   * @param {*} opts.value the value to store in the trie
   * @param {Map} opts.edges the edges that this vertex has stored a `Map` edge name => `Vertex`
   * @param {Store} opts.store the store that this vertex will use
   */
  constructor (opts = {}) {
    this.value = opts.value
    this.edges = opts.edges || new Map()
    this._store = opts.store || new Store()
    this._cache = opts.cache || new CacheVertex()
    this._cache.vertex = this

    this._store.Vertex = Vertex

    // convert into map
    const edges = this.edges
    this.edges = new Map()
    Object.keys(edges).forEach(key => {
      this.edges.set(key, new CID(edges[key]['/']))
    })
  }

  /**
   * Get the parent or root vertex from which this vertex was found by.
   * Not all Vertices have root vertices, only vertice that where resolve be
   * get/update have roots
   */
  get root () {
    return this._cache.root.vertex
  }

  /**
   * @return {Promise} the promise resolves the serialized Vertex
   */
  serialize () {
    return Vertex.serialize(this)
  }

  static serialize (vertex) {
    return new Promise((resolve, reject) => {
      const edges = {};
      [...vertex.edges].forEach(([name, edge]) => {
        edges[name] = {
          '/': edge.buffer
        }
      })

      dagCBOR.util.serialize([vertex.value, edges], (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  static deserialize (data) {
    return new Promise((resolve, reject) => {
      dagCBOR.util.deserialize(data, (err, [value, edges]) => {
        if (err) {
          reject(err)
        } else {
          resolve(new Vertex({
            value: value,
            edges: edges
          }))
        }
      })
    })
  }

  /**
   * @return {Promise} the promise resolves the hash of this vertex
   */
  hash () {
    return this.serialize().then(data => Vertex.hash(data))
  }

  static hash (data) {
    return new Promise((resolve, reject) => {
      resolve(dagCBOR.util.cid(data, (err, cid) => {
        if (err) {
          reject(err)
        } else {
          resolve(cid)
        }
      }))
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

  /**
   * Set an edge on a given path to the given vertex
   * @param {Array} path
   * @param {Vertex} vertex
   */
  set (path, newVertex) {
    newVertex.store = this.store
    this._cache.update(path, vertex => {
      vertex.value = {
        op: 'set',
        vertex: newVertex
      }

      newVertex._cache = vertex
      return vertex
    })
  }

  /**
   * deletes an Edge at the end of given path
   * @param {Array} path
   * @return {boolean} Whether or not anything was deleted
   */
  del (path) {
    this._cache.del(path)
  }

  /**
   * get a vertex given a path
   * @param {Array} path
   * @return {Promise}
   */
  async get (path) {
    // check the cache first
    const cachedVertex = this._cache.get(path)
    if (!cachedVertex || !cachedVertex.hasVertex) {
      // get the value from the store
      return this._store.getPath(this, path)
    } else if (cachedVertex.op === 'del') {
      // the value is marked for deletion
      if (cachedVertex.isLeaf) {
        throw new Error('no vertex was found')
      } else {
        // the value was deleted but then another value was saved along this path
        cachedVertex.vertex = new Vertex({
          store: this._store,
          cache: cachedVertex
        })
        return cachedVertex.vertex
      }
    } else {
      // return the cached value
      return cachedVertex.vertex
    }
  }

  /**
   * Updates an edge on a given path . If the path does not already exist this
   * will extend the path. If no value is returned then the vertex that did exist will be deleted
   * @param {Array} path
   * @return {Promise}  the promise resolves a vertex and a callback funtion that is used to update the vertex
   * @example
   * rootVertex.update(path).then(([vertex, resolve]) => {
   *   resolve(new Vertex({value: 'some new value'}))
   * })
   */
  update (path) {
    return new Promise(resolve => {
      // checks the cache first
      this._cache.updateAsync(path, (cachedVertex, updateCacheFn) => {
        if (cachedVertex.op === 'del') {
          onVertexFound(new Vertex({
            store: this._store,
            cache: cachedVertex
          }))
        } else if (cachedVertex.vertex) {
          onVertexFound(cachedVertex.vertex)
        } else {
          // if there is no vertex found in the cache
          this._store.getPath(this, path)
            .then(onVertexFound)
            .catch(() => {
              onVertexFound(new Vertex({
                store: this._store,
                cache: cachedVertex
              }))
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

  /**
   * flush the cache of saved operation to the store
   * @return {Promise}
   */
  flush () {
    return this._store.batch(this._cache)
  }

  /**
   * creates a copy of the merkle trie. Work done on this copy will not affect
   * the original.
   * @return {Vertex}
   */
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
