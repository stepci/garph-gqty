import { g } from 'garph'
import { createClient, InferClient } from './index'

const x = g.type('X', {
  a: g.string(),
})

const y = g.type('Y', {
  b: g.string(),
})

const union = g.unionType('Union', { x, y })

const queryType = g.type('Query', {
  test: g.ref<typeof union>('Union')
})

type ClientTypes = InferClient<{ query: typeof queryType }>

const { useQuery } = createClient<ClientTypes>({
  schema: g,
  url: 'http://localhost:4000/graphql'
})
