const multicodec = require('multicodec')
const Levelup = require('levelup')
const memdown = require('memdown')
const Vertex = require('./index.js')
const Link = require('./link.js')
const Readable = require('./readStream.js')

module.exports = class Store {
  /**
   * Store for merkle tries
   * @param {Levelup} db a levelup instance used to store the store
   * @param {Object} resolvers a map of multiformat perfixes to unserializtion function
   */
  constructor (db = new Levelup('', {db: memdown}), resolvers = {'cbor': Vertex.unserialize, null: Vertex}) {
    this._db = db
    this._resolvers = resolvers
  }

  /**
   * Stores a vertex in the db, returning its merkle link
   * @param {Vertex}
   * @return {Promise}
   */
  set (vertex) {
    // todo check if vertices are virtual
    return new Promise((resolve, reject) => {
      const buffer = vertex.serialize()
      const hash = vertex.constructor.hash(buffer)
      this._db.put(hash, buffer, resolve.bind(resolve, new Link(hash)))
    })
  }

  /**
   * Fetches a Vertex from the db
   * @param {Vertex} rootVertex the vertex to start fetching from
   * @param {Array} path the path to fetch
   * @return {Promise}
   */
  get (rootVertex, path) {
    path = path.slice(0)
    return new Promise((resolve, reject) => {
      this._get(rootVertex, path, resolve, reject)
    })
  }

  _get (rootVertex, path, resolve, reject) {
    if (!rootVertex) {
      return reject('no vertex was found')
    }

    if (!path.length) {
      return resolve(rootVertex)
    }

    const edge = rootVertex.edges.get(path.shift())
    if (edge instanceof Link) {
      this.getLink(edge).then(vertex => this._get(vertex, path, resolve, reject))
    } else {
      this._get(edge, path, resolve, reject)
    }
  }

  /**
   * resolves a merkle link to a Vertex
   * @param {Link} link
   * @return {Promise}
   */
  getLink (link) {
    return new Promise((resolve, reject) => {
      this._db.get(link.hash, (err, data) => {
        if (err) {
          reject(err)
        } else {
          const codec = multicodec.getCodec(data)
          const vertex = this._resolvers[codec](data)
          vertex._store = this
          resolve(vertex)
        }
      })
    })
  }

  /**
   * flush a cache trie to the db returning a promise that resolves to a merkle link
   * @param {Cache}
   * @return {Promise}
   */
  batch (cache) {
    let promise
    if (cache.op === 'del' && cache.isLeaf) {
      return false
    }

    if (!cache.vertex) {
      // this vertex has never existed before!
      cache.vertex = new Vertex({store: this, cache: cache})
      promise = Promise.all([...cache.edges].map(([, vertex]) => this.batch(vertex)))
    } else {
      promise = Promise.all([...cache.edges].map(([name, nextedCache]) => {
        // if the edge of the vertex is merkle link and the also has the same path
        // but doesn't have a new vertex then resolve the that edge
        //     a <-- we are here in the trie
        //     |
        //     b <-- we are going here next, do we already know about this vertex?
        const link = cache.vertex.edges.get(name)
        if (link && nextedCache.op !== 'del' && !nextedCache.vertex) {
          return this.getLink(link).then(foundVertex => {
            nextedCache.vertex = foundVertex
            return this.batch(nextedCache)
          })
        } else {
          return this.batch(nextedCache)
        }
      }))
    }

    return promise
      .then(hashes => {
        for (const [edge] of cache.edges) {
          const hash = hashes.shift()
          if (hash) {
            cache.vertex.edges.set(edge, hash)
          } else {
            cache.vertex.edges.delete(edge)
          }
        }

        cache.clear()
        if (cache.vertex.isEmpty) {
          // dont save empty trie nodes
          return false
        } else {
          return this.set(cache.vertex)
        }
      })
  }

  /**
   * Creates a read stream returning all the Vertices in a trie given a root merkle link
   * @param {Link} link
   * @return {ReadStream}
   */
  createReadStream (link) {
    return new Readable({}, link, this)
  }
}
