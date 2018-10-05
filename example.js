const IPFS = require('ipfs')
const Graph = require('./')
const ipfs = new IPFS()

ipfs.on('start', async () => {
  const graph = new Graph(ipfs.dag)
  const a = {
    some: {
      thing: 'nested'
    }
  }
  const b = {
    lol: 1
  }

  console.log(JSON.stringify(a, null, 2))

  await graph.set(a, 'some/thing/else', b)
  console.log(JSON.stringify(a, null, 2))

  var x = await graph.get(a, 'some/thing/else')
  console.log(x)

  await graph.flush(a)
  console.log(JSON.stringify(a, null, 2))
  ipfs.stop()
})
