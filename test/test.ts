import { buildSchema } from 'graphql'
import { createClient } from '../src/index'
import { readFileSync } from 'fs'

const schema = buildSchema(readFileSync('./test/schema.gql', 'utf8'))
createClient({
  schema,
  url: 'http://localhost:4000/graphql',
})
