import { buildSchema } from 'graphql'
import { createClient } from '../src/index'
import { createGeneratedSchema, createScalarsEnumsHash } from '../src/utils'
import { readFileSync } from 'fs'

const schema = buildSchema(readFileSync('./test/schema.gql', 'utf8'))

createClient({
  generatedSchema: createGeneratedSchema(schema),
  scalarsEnumsHash: createScalarsEnumsHash(schema),
  url: 'http://localhost:4000/graphql',
})
