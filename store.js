const Vertex = require('./index.js')
const Readable = require('./readStream.js')
const IPLDResolver = require('ipld-resolver')
const Block = require('ipfs-block')

module.exports = class Resolver extends IPLDResolver {

  /**
   * Stores a vertex in the db, returning its merkle link
   * @param {Vertex}
   * @return {Promise}
   */
  set (vertex) {
    let buffer
    return vertex.serialize().then(b => {
      buffer = b
      return vertex.constructor.hash(buffer)
    }).then(hash => {
      return new Promise((resolve, reject) => {
        this.bs.put({
          cid: hash,
          block: new Block(buffer)
        }, resolve.bind(resolve, hash))
      })
    })
  }

  /**
   * Fetches a Vertex from the db
   * @param {Vertex} rootVertex the vertex to start fetching from
   * @param {Array} path the path to fetch
   * @return {Promise}
   */
  getPath (rootVertex, path) {
    path = path.slice(0)
    return new Promise((resolve, reject) => {
      this._getPath(rootVertex, path, resolve, reject)
    })
  }

  _getPath (rootVertex, path, resolve, reject) {
    if (!rootVertex) {
      return reject('no vertex was found')
    }

    if (!path.length) {
      return resolve(rootVertex)
    }

    let edge = rootVertex.edges.get(path.shift())
    if (edge) {
      this.getCID(edge).then(vertex => this._getPath(vertex, path, resolve, reject))
    } else {
      this._getPath(edge, path, resolve, reject)
    }
  }

  /**
   * resolves a [CID](https://github.com/ipfs/js-cid) to a Vertex
   * @param {CID} [cid](https://github.com/ipfs/js-cid)
   * @return {Promise}
   */
  getCID (cid) {
    return new Promise((resolve, reject) => {
      this.get(cid, (err, [value, edges]) => {
        if (err) {
          reject(err)
        } else {
          resolve(new Vertex({
            value: value,
            edges: edges,
            store: this
          }))
        }
      })
    })
  }

  /**
   * flush a cache trie to the db returning a promise that resolves to a merkle
   * link in the form of a [cid](https://github.com/ipfs/js-cid)
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
        const cid = cache.vertex.edges.get(name)
        if (cid && nextedCache.op !== 'del' && !nextedCache.vertex) {
          return this.getCID(cid).then(foundVertex => {
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
   * @param {CID} [cid](https://github.com/ipfs/js-cid)
   * @return {ReadStream}
   */
  createReadStream (cid) {
    return new Readable({}, cid, this)
  }
}
