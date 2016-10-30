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
  async set (vertex) {
    let buffer = await vertex.serialize()
    let hash = await vertex.constructor.hash(buffer)
    return new Promise((resolve, reject) => {
      this.bs.put({
        cid: hash,
        block: new Block(buffer)
      }, resolve.bind(resolve, hash))
    })
  }

  /**
   * Fetches a Vertex from the db
   * @param {Vertex} rootVertex the vertex to start fetching from
   * @param {Array} path the path to fetch
   * @return {Promise}
   */
  async getPath (vertex, path) {
    for (let name of path) {
      let edge = vertex.edges.get(name)
      if (edge) {
        vertex = await this.getCID(edge)
      } else {
        throw new Error('no vertex was found')
      }
    }
    return vertex
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
  async batch (cache) {
    let promise
    if (cache.op === 'del' && cache.isLeaf) {
      return false
    }

    if (!cache.vertex) {
      // this vertex has never existed before!
      cache.vertex = new Vertex({store: this, cache: cache})
      promise = Promise.all([...cache.edges].map(([, vertex]) => this.batch(vertex)))
    } else {
      promise = Promise.all([...cache.edges].map(async ([name, nextedCache]) => {
        // if the edge of the vertex is merkle link and the also has the same path
        // but doesn't have a new vertex then resolve the that edge
        //     a <-- we are here in the trie
        //     |
        //     b <-- we are going here next, do we already know about this vertex?
        const cid = cache.vertex.edges.get(name)
        if (cid && nextedCache.op !== 'del' && !nextedCache.vertex) {
          const foundVertex = await this.getCID(cid)
          nextedCache.vertex = foundVertex
          return this.batch(nextedCache)
        } else {
          return this.batch(nextedCache)
        }
      }))
    }

    const hashes = await promise
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
