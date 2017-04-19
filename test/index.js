const tape = require('tape')
const IPFS = require('ipfs')
const CID = require('cids')
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
    let result = await node.dag.get(new CID(cid['/']), 'some/lol')
    t.deepEquals(result.value, 'test', 'should flush to dag store')

    result = await node.dag.get(new CID(cid['/']))

    let getResult = await graph.get(result.value, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    getResult = await graph.get(expect, 'some/lol')
    t.deepEquals(getResult, 'test', 'should get a value correctly')

    t.end()
  })

  tape('flushing multiple leaf values', async t => {
    const graph = new Graph(node.dag)
    const a = {
      '/': {
        thing: {
          two: {
            '/': {
              lol: 'test'
            }
          },
          else: {
            '/': {
              lol: 'test'
            }
          }
        }
      }
    }

    const b = a['/']
    const expectedA = {
      '/': 'zdpuAncHcnA7MJnwFrxY8JxFQ5i8secxvWcWuLiktwatTgpxf'
    }
    const expectedB = {
      thing: {
        two: {
          '/': 'zdpuB1BH4aTUFEXbCxESk41PQieE1fLcpPcmFnqd89ZPtJWaf'
        },
        else: {
          '/': 'zdpuB1BH4aTUFEXbCxESk41PQieE1fLcpPcmFnqd89ZPtJWaf'
        }
      }
    }

    await graph.flush(a)
    t.deepEquals(a, expectedA, 'should flush correctly')
    t.deepEquals(b, expectedB, 'should flush correctly')

    const val = await graph.get(a, 'thing/two/lol')
    t.equals(val, 'test', 'should find the corret value')
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
