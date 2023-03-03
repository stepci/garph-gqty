import { g, InferClient } from 'garph'
import { createClient } from "./index"

const queryType = g.type('Query', {
  test: g.string()
})

type ClientTypes = InferClient<{ query: typeof queryType }>

const { useQuery } = createClient<ClientTypes>(g, {
  url: 'http://localhost:4000/graphql'
})

useQuery()
