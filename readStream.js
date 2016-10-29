const Readable = require('readable-stream').Readable

module.exports = class TrieReadable extends Readable {
  constructor (opts = {}, link, store) {
    opts.objectMode = true
    super(opts)
    this._link = link
    this._opts = opts
    this._store = store
    this._reading = false
    this._numOfReading = 0
  }

  _read () {
    if (!this._reading) {
      this._reading = true
      this.__read()
    }
  }

  __read () {
    this._store.getCID(this._link).then(vertex => {
      this.push(vertex)
      if (vertex.isLeaf) {
        this.push(null)
      } else {
        for (let [, edge] of vertex.edges) {
          this._numOfReading++
          const readStream = new TrieReadable(this._opts, edge, this._store)
          readStream.on('data', vertex => {
            this.push(vertex)
          })
          readStream.on('end', vertex => {
            this._numOfReading--
            if (this._numOfReading === 0) {
              this.push(null)
            }
          })
        }
      }
    })
  }
}
