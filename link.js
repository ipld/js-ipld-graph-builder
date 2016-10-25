module.exports = class Link {
  constructor (hash) {
    this.hash = hash
  }

  toBuffer () {
    return this.hash
  }
}
