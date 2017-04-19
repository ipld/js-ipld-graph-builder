const CID = require('cids')
const multihashes = require('multihashes')

function isValidCID (link) {
  return (typeof link === 'string' || Buffer.isBuffer(link)) && !link.options
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
    value = {
      '/': value
    }
    path = path.split('/')
    const last = path.pop()
    let {
      value: foundVal,
      remainderPath: remainder,
      parent
    } = await this._get(root, path)
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
    return root
  }

  async _get (root, path) {
    let parent = root
    path = path.slice(0)
    while (1) {
      const link = root['/']
      // if there is a link, traverse throught it
      if (link) {
        if (isValidCID(link)) {
          const cid = new CID(link)
          root.format = cid.codec
          root.hashAlg = multihashes.decode(cid.multihash).name
          root = root['/'] = (await this._dag.get(cid)).value
        } else {
          root = link
        }
      } else {
        // traverse through POJOs
        if (!path.length) {
          break
        }
        const name = path.shift()
        const edge = root[name]
        if (edge) {
          parent = root
          root = edge
        } else {
          path.unshift(name)
          return {
            value: root,
            remainderPath: path,
            parent: parent
          }
        }
      }
    }
    return {
      value: root,
      remainderPath: [],
      parent: parent
    }
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

  async _flush (root, opts) {
    const awaiting = []
    if (isObject(root)) {
      for (const name in root) {
        const edge = root[name]
        awaiting.push(this._flush(edge))
      }
    }
    await Promise.all(awaiting)
    const link = root['/']
    if (link && !isValidCID(link)) {
      return this._dag.put(link, opts || root.options || {
        format: 'dag-cbor',
        hashAlg: 'sha2-256'
      }).then(cid => {
        root['/'] = cid.toBaseEncodedString()
      })
    }
  }

  /**
   * flush an object to ipfs returning the resulting CID in a promise
   * @param {Object} root
   * @param {Object} opts - encoding options for [`dag.put`](https://github.com/ipfs/interface-ipfs-core/tree/master/API/dag#dagput)
   * @return {Promise}
   */
  async flush (root, opts) {
    if (!root['/']) {
      const oldRoot = Object.assign({}, root)
      clearObject(root)
      root['/'] = oldRoot
    }
    await this._flush(root, opts)
    return root
  }
}
