const Readable = require('readable-stream').Readable

module.exports = class TrieReadable extends Readable {
  constuctor (opts = {}, targetVertex, lastVertex, path) {
    opts.objectMode = true
    super(opts)
    this._pausedVertices = [[[], targetVertex]]
    this._numOfRunningGets = 0
  }

  _read () {
    this._running = true
    while (this._running && this._pausedVertices.length) {
      const streamVal = this._pausedVertices.pop()
      this._running = this.push(streamVal)
      this.read(...streamVal)
    }
  }

  read (path = [], vertex) {
    const edgeIt = vertex.edges[Symbol.iterator]()
    let next = edgeIt.next()
    while (!next.done) {
      const nextVertex = next.value[1];
      (() => {
        const edge = next.value[0]
        this._numOfRunningGest++
        this.vertex.get(nextVertex).then(foundVertex => {
          const nextPath = path.slice(0).push(edge)
          pushToStream(nextPath, foundVertex)
          if (this._running) {
            this.read(foundVertex, nextPath)
          }
        })
      })()
      next = edgeIt.next()
    }

    function pushToStream (path, vertex) {
      const streamVal = [path, vertex]
      if (this._running) {
        this._running = this.push(streamVal)
        this._numOfRunningGets--
          // check if we have synced the trie yet
        if (this._numOfRunningGets === 0) {
          this._push(null)
        }
      } else {
        this._pausedVertices.push(streamVal)
      }
    }
  }
}
