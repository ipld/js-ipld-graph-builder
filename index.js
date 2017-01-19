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

    this._root = opts.root || this
    this._path = opts.path || []

    if (this.isRoot) {
      this._cache = opts.cache || new CacheVertex('set', this)
      this._store = opts.store || new Store()
      this._store.Vertex = Vertex
    }

    // convert edges into map
    const edges = this.edges
    this.edges = new Map()
    Object.keys(edges).forEach(key => {
      const edge = edges[key]['/']
      this.edges.set(key, new CID(edge.version, edge.codec, new Buffer(edge.hash)))
    })
  }

  get isRoot () {
    return this._root === this
  }

  /**
   * Get the root vertex from which this vertex was found by.
   * Not all Vertices have root vertices, only vertice that where resolve by
   * get/update have roots
   */
  get root () {
    return this.pathAndRoot[1]
  }

  get path () {
    return this.pathAndRoot[0]
  }

  get pathAndRoot () {
    let path = []
    let vertex = this
    while (!vertex.isRoot) {
      path = vertex._path.concat(path)
      vertex = vertex._root
    }
    return [path, vertex]
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
          '/': edge.toJSON()
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
  cid () {
    return this.serialize().then(data => Vertex.cid(data))
  }

  static cid (data) {
    return new Promise((resolve, reject) => {
      dagCBOR.util.cid(data, (err, cid) => {
        if (err) {
          reject(err)
        } else {
          resolve(cid)
        }
      })
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
    if (!path.length) {
      this.value = newVertex.value
      this.edges = newVertex.edges
    }
    const [thisPath, root] = this.pathAndRoot
    path = thisPath.concat(path)
    root._cache.set(path, newVertex)
    newVertex._root = this._root
    newVertex._path = path
  }

  /**
   * deletes an Edge at the end of given path
   * @param {Array} path
   * @return {boolean} Whether or not anything was deleted
   */
  del (path) {
    const [thisPath, root] = this.pathAndRoot
    path = thisPath.concat(path)
    root._cache.del(path)
  }

  /**
   * get a vertex given a path
   * @param {Array} path
   * @return {Promise}
   */
  async get (path) {
    path = this.path.concat(path)
    // check the cache first
    const cachedVertex = this._root._cache.get(path)
    if (!cachedVertex || !cachedVertex.hasVertex) {
      // get the value from the store
      try {
        const result = await this._root._store.getPath(this, path)
        result._root = this.root
        result._path = path
        return result
      } catch (e) {
        if (cachedVertex) {
          return new Vertex({
            root: this.root,
            path: path
          })
        } else {
          throw (e)
        }
      }
    } else if (cachedVertex.op === 'del') {
      // the value is marked for deletion
      if (cachedVertex.isLeaf) {
        throw new Error('no vertex was found')
      } else {
        // the value was deleted but then another value was saved along this path
        return new Vertex({
          root: this.root,
          path: path
        })
      }
    } else {
      // return the cached value
      return cachedVertex.vertex
    }
  }

  /**
   * flush the cache of saved operation to the store
   * @return {Promise}
   */
  flush () {
    return this.root._store.batch(this.root._cache.get(this._path))
  }

  /**
   * creates a copy of the merkle trie. Work done on this copy will not affect
   * the original.
   * @return {Vertex}
   */
  copy () {
    return new Vertex({
      value: this.value,
      edges: this.edges,
      cache: this.root._cache.get(this._path).copy()
    })
  }
}
