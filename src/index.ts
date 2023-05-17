import {
  createClient as createGQtyClient,
  Cache,
  QueryFetcher,
  ScalarsEnumsHash,
  Schema,
  SubscriptionClient,
  CacheOptions
} from 'gqty'

import { createReactClient, ReactClientDefaults } from '@gqty/react'
import type { InferClient } from 'garph/dist/client'

type ClientOptions = {
  generatedSchema: Schema
  scalarsEnumsHash: ScalarsEnumsHash
  url: string
  subscriptionClient?: SubscriptionClient
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

  const client = createGQtyClient<GeneratedSchema>({
    scalars: options.scalarsEnumsHash,
    schema: options.generatedSchema,
    cache,
    fetchOptions: {
      fetcher: queryFetcher,
      subscriber: options.subscriptionClient,
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
