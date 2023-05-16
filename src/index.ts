import type { GraphQLSchema } from 'graphql'
import { createClient as createGQtyClient, Cache, CacheOptions } from 'gqty'
import { createClient as createSubscriptionsClient } from 'graphql-sse'
import type { QueryFetcher, ScalarsEnumsHash, Schema } from 'gqty'
import { createReactClient, ReactClientDefaults } from '@gqty/react'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'
import type { InferClient } from 'garph/dist/client'

type ClientOptions = {
  generatedSchema?: Schema
  scalarsEnumsHash?: ScalarsEnumsHash
  schema: GraphQLSchema
  url: string
  subscriptionsUrl?: string
  headers?: HeadersInit
  defaults?: ReactClientDefaults
  cacheOptions?: CacheOptions
}

// TODO
type SchemaTypes = {
  query: any
  mutation?: any
  subscription?: any
}

function createQueryFetcher (options: ClientOptions): QueryFetcher {
  return async function (
    { query, variables, operationName },
    fetchOptions
  ) {
    const response = await fetch(options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
      mode: "cors",
      ...fetchOptions,
    })

    const json = await response.json()
    return json
  }
}

export function createClient<T extends SchemaTypes>(options: ClientOptions) {
  const queryFetcher = createQueryFetcher(options)

  type Query = T['query']
  type Mutation = T['mutation']
  type Subscription = T['subscription']

  type GeneratedSchema = {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  const cache = new Cache(
    undefined,
    /**
     * Default cache options immediate expiry with a 5 minutes window of
     * stale-while-revalidate.
     */
    {
      maxAge: 0,
      staleWhileRevalidate: 5 * 60 * 1000,
      normalization: true,
      ...options.cacheOptions
    }
  )

  const subscriptionsClient =
    typeof window !== "undefined"
      ? createSubscriptionsClient({
          url: options.subscriptionsUrl || options.url + '/stream',
        })
      : undefined

  const client = createGQtyClient<GeneratedSchema>({
    scalars: options.scalarsEnumsHash || createScalarsEnumsHash(options.schema),
    schema: options.generatedSchema || createGeneratedSchema(options.schema),
    cache,
    fetchOptions: {
      fetcher: queryFetcher,
      subscriber: subscriptionsClient
    },
  })

  const reactClient = createReactClient<GeneratedSchema>(client, {
    defaults: {
      suspense: false,
      staleWhileRevalidate: false,
      ...options.defaults
    }
  })

  return { ...client, ...reactClient }
}

export { InferClient }
