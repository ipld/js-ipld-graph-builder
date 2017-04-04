const deepcopy = require('deepcopy')
const CID = require('cids')
const multihashes = require('multihashes')

module.exports = class Graph {
  /**
   * @param {Object} ipfsDag an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)
   */
  constructor (ipfsDag) {
    this._dag = ipfsDag
  }

  /**
   * sets a value on a root object given its path
   * @param {Object} root
   * @param {String} path
   * @param {*} value
   * @return {Promise}
   */
  async set (root, path, value) {
    path = path.split('/')
    value = {
      '/': value
    }
    const last = path.pop()
    let {value: foundVal, remainderPath: remainder} = await this._get(root, path)
    if (remainder) {
      for (const elem of remainder) {
        foundVal = foundVal[elem] = {}
      }
    }
    foundVal[last] = value
    return root
  }

  async _get (root, path) {
    let edge
    while (path.length) {
      const name = path.shift()
      edge = root[name]
      if (edge && typeof edge !== 'string') {
        const link = edge['/']
        if (isValidCID(link)) {
          const cid = new CID(link)
          edge.format = cid.codec
          edge.hashAlg = multihashes.decode(cid.multihash).name
          root = edge['/'] = (await this._dag.get(cid)).value
        } else if (link) {
          root = link
        } else {
          root = edge
        }
      } else {
        path.unshift(name)
        return {value: root, remainderPath: path}
      }
    }
    return {value: root}
  }

  /**
   * traverses an object's path and returns the resulting value in a Promise
   * @param {Object} root
   * @param {String} path
   * @return {Promise}
   */
  async get (root, path) {
    path = path.split('/')
    const {value} = await this._get(root, path)
    return value
  }

  /**
   * flush an object to ipfs returning the resulting CID in a promise
   * @param {Object} root
   * @param {Object} opts - encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
   * @return {Promise}
   */
  async flush (root, opts) {
    const awaiting = []
    for (const name in root) {
      const edge = root[name]
      const link = edge['/']
      if (link && !isValidCID(link)) {
        awaiting.push(this.flush(link).then(cid => {
          edge['/'] = cid.toBaseEncodedString()
        }))
      }
    }
    await Promise.all(awaiting)
    return this._dag.put(root, opts || root.options || {
      format: 'dag-cbor',
      hashAlg: 'sha2-256'
    })
  }

  /**
   * clones an Object via a deeep copy
   * @param {Object} root
   * return {Object}
   */
  clone (root) {
    return deepcopy(root)
  }
}

function isValidCID (link) {
  return typeof link === 'string' || Buffer.isBuffer(link) && !link.options
}
