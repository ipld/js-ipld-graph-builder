const CID = require('cids')
const multihashes = require('multihashes')
const assert = require('assert')

function isValidCID (link) {
  try {
    CID.isCID(new CID(link))
  } catch (e) {
    return false
  }
  return true
}

function isObject (obj) {
  return typeof obj === 'object' && obj !== null
}

function clearObject (myObject) {
  for (var member in myObject) {
    delete myObject[member]
  }
}

module.exports = class Graph {
  /**
   * @param {Object} ipfsDag an instance of [ipfs.dag](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dag-api)
   */
  constructor (ipfsDag) {
    assert(ipfsDag, 'ipld-graph must have an instance of ipfs.dag')
    this._dag = ipfsDag
  }

  async _loadCID (node, link) {
    const cid = new CID(link)
    node.options = {}
    node.options.format = cid.codec
    node.options.hashAlg = multihashes.decode(cid.multihash).name
    node['/'] = (await this._dag.get(cid)).value
  }

  /**
   * sets a value on a root object given its path
   * @param {Object} node
   * @param {String} path
   * @param {*} value
   * @return {Promise}
   */
  async set (node, path, value) {
    value = {
      '/': value
    }
    path = path.split('/')
    const last = path.pop()
    let {
      value: foundVal,
      remainderPath: remainder,
      parent
    } = await this._get(node, path)
    // if the found value is a litaral attach an object to the parent object
    if (!isObject(foundVal)) {
      const pos = path.length - remainder.length - 1
      const name = path.slice(pos, pos + 1)[0]
      foundVal = parent[name] = {}
    }
    // extend the path for the left over path names
    for (const name of remainder) {
      foundVal = foundVal[name] = {}
    }
    foundVal[last] = value
    return node
  }

  async _get (node, path) {
    let parent = node
    path = path.slice(0)
    while (1) {
      const link = node['/']
      // if there is a link, traverse throught it
      if (isValidCID(link)) {
        await this._loadCID(node, link)
      } else if (link) {
        // link is a POJO
        node = link
      } else {
        // traverse through POJOs
        if (!path.length) {
          break
        }
        const name = path.shift()
        const edge = node[name]
        if (edge) {
          parent = node
          node = edge
        } else {
          path.unshift(name)
          return {
            value: node,
            remainderPath: path,
            parent: parent
          }
        }
      }
    }
    return {
      value: node,
      remainderPath: [],
      parent: parent
    }
  }

  /**
   * traverses an object's path and returns the resulting value in a Promise
   * @param {Object} node
   * @param {String} path
   * @return {Promise}
   */
  async get (node, path) {
    path = path.split('/')
    const {value} = await this._get(node, path)
    return value
  }

  /**
   * Resolves all the links in an object and does so recusivly for N `level`
   * @param {Object} node
   * @param {Integer} levels
   * @return {Promise}
   */
  async tree (node, levels = 1) {
    const link = node['/']
    if (isValidCID(link)) {
      await this._loadCID(node, link)
    }

    if (levels && isObject(node)) {
      levels--
      const promises = []
      for (const name in node) {
        const edge = node[name]
        promises.push(this.tree(edge, levels))
      }
      await Promise.all(promises)
    }
    return node
  }

  async _flush (node, opts = {format: 'dag-cbor', hashAlg: 'sha2-256'}) {
    const awaiting = []
    if (isObject(node)) {
      for (const name in node) {
        const edge = node[name]
        awaiting.push(this._flush(edge))
      }

      await Promise.all(awaiting)
      const link = node['/']

      if (link !== undefined && !isValidCID(link)) {
        return this._dag.put(link, node.options || opts).then(cid => {
          node['/'] = cid.toBaseEncodedString()
        })
      }
    }
  }

  /**
   * flush an object to ipfs returning the resulting CID in a promise
   * @param {Object} node
   * @param {Object} opts - encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
   * @return {Promise}
   */
  async flush (node, opts) {
    if (!node['/']) {
      const oldRoot = Object.assign({}, node)
      clearObject(node)
      node['/'] = oldRoot
    }
    await this._flush(node, opts)
    return node
  }
}
