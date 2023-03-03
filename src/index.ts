import { GarphSchema } from 'garph'
import { createClient as createGQtyClient, QueryFetcher } from 'gqty'
import { createReactClient, ReactClientDefaults } from '@gqty/react'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'

type ClientOptions = {
  url: string
  headers?: HeadersInit
  defaults?: ReactClientDefaults
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

type SchemaTypes = {
  query: any
  mutation?: any
  subscription?: any
}

export function createClient <T extends SchemaTypes>(g: GarphSchema, options: ClientOptions) {
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
    schema: createGeneratedSchema(g.types),
    scalarsEnumsHash: createScalarsEnumsHash(g.types),
    queryFetcher
  })

  return createReactClient<GeneratedSchema>(client, {
    defaults: {
      suspense: true,
      staleWhileRevalidate: false,
      ...options.defaults
    }
  })
}
