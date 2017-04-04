const tape = require('tape')
const IPFS = require('ipfs')
const Graph = require('../')

const node = new IPFS()
node.on('error', err => {
  console.log(err)
})

node.on('start', () => {
  tape('testing graph builder', async t => {
    const graph = new Graph(node.dag)
    const a = {
      some: {
        thing: 'nested'
      }
    }
    const b = {
      lol: 1
    }
    let expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: 1
            }
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else', b)
    t.deepEquals(a, expect, 'should set a value correctly')
    await graph.set(a, 'some', b)
    expect = {
      some: {
        '/': {
          'lol': 1
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    const some = await graph.get(expect, 'some')
    t.deepEquals(some, {'lol': 1}, 'should traverse objects with links')

    const cloneA = graph.clone(a)
    const cid = await graph.flush(a)
    let result = await node.dag.get(cid, 'some/lol')
    t.deepEquals(result.value, 1, 'should flush to dag store')
    t.deepEquals(cloneA, expect, 'cloned A should not change')

    result = await node.dag.get(cid)

    let getResult = await graph.get(result.value, 'some/lol')
    t.deepEquals(getResult, 1, 'should get a value correctly')

    getResult = await graph.get(expect, 'some/lol')
    t.deepEquals(getResult, 1, 'should get a value correctly')

    node.stop(() => {
      t.end()
      process.exit()
    })
  })
})
