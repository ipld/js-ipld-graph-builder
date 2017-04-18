const tape = require('tape')
const IPFS = require('ipfs')
const cid = require('cids')
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
      lol: 'test'
    }
    let expect = {
      some: {
        thing: {
          else: {
            here: {
              '/': {
                lol: 'test'
              }
            }
          }
        }
      }
    }

    await graph.set(a, 'some/thing/else/here', b)
    t.deepEquals(a, expect, 'should set a value correctly')
    await graph.set(a, 'some', b)
    expect = {
      some: {
        '/': {
          'lol': 'test'
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    const some = await graph.get(expect, 'some')
    t.deepEquals(some, {'lol': 'test'}, 'should traverse objects with links')

    const cid = await graph.flush(a)
    let result = await node.dag.get(cid, 'some/lol')
    t.deepEquals(result.value, 'test', 'should flush to dag store')

    result = await node.dag.get(cid)

    let getResult = await graph.get(result.value, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    getResult = await graph.get(expect, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    t.end()
  })
  tape('testing setting leaf values', async t => {
    const graph = new Graph(node.dag)
    const a = {
      some: {
        thing: 'nested'
      }
    }
    const b = {
      lol: 'test'
    }
    let expect = {
      some: {
        thing: {
          else: {
            '/': {
              lol: 'test'
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
          'lol': 'test'
        }
      }
    }
    t.deepEquals(a, expect, 'should set a value correctly')

    node.stop(() => {
      t.end()
      process.exit()
    })
  })
})
