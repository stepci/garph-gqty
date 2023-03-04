import { GarphSchema } from 'garph'
import { createClient as createGQtyClient, QueryFetcher } from 'gqty'
import { createReactClient, ReactClientDefaults } from '@gqty/react'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'
import { InferClient } from 'garph/dist/client'

type ClientOptions = {
  schema: GarphSchema
  url: string
  headers?: HeadersInit
  defaults?: ReactClientDefaults
}

// TODO
type SchemaTypes = {
  query: any
  mutation?: any
  subscription?: any
}

function createQueryFetcher (options: ClientOptions): QueryFetcher {
  return async function (
    query,
    variables,
    fetchOptions
  ) {
    const response = await fetch(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify({
        query,
        variables
      }),
      mode: 'cors',
      ...fetchOptions
    })

    const json = await response.json()
    return json
  }
}

export function createClient <T extends SchemaTypes>(options: ClientOptions) {
  const queryFetcher = createQueryFetcher(options)

  type Query = {
    __typename?: "Query"
  } & T['query']

  type Mutation = {
    __typename?: "Mutation"
  } & T['mutation']

  type Subscription = {
    __typename?: "Subscription"
  } & T['subscription']

  type SchemaObjectTypes = {
    Mutation: Mutation
    Query: Query
    Subscription: Subscription
  }

  type SchemaObjectTypesNames = "Mutation" | "Query" | "Subscription"

  type GeneratedSchema = {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  const client = createGQtyClient<
    GeneratedSchema,
    SchemaObjectTypesNames,
    SchemaObjectTypes
  >({
    schema: createGeneratedSchema(options.schema.types),
    scalarsEnumsHash: createScalarsEnumsHash(options.schema.types),
    queryFetcher
  })

  const reactClient = createReactClient<GeneratedSchema>(client, {
    defaults: {
      suspense: true,
      staleWhileRevalidate: false,
      ...options.defaults
    }
  })

  return { ...client, ...reactClient }
}

export { InferClient }
