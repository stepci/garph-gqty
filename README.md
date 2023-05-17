# @garph/gqty

[tRPC](https://github.com/trpc/trpc)-style client for [Garph](https://github.com/stepci/garph), based on [GQty](https://github.com/gqty-dev/gqty)

```
npm i @garph/gqty
```

Example:

**schema.ts**

```ts
import { g, buildSchema } from 'garph'

export const queryType = g.type('Query', {
  greet: g.string()
    .args({
      name: g.string().optional().default('Max'),
    })
    .description('Greets a person')
})

const schema = buildSchema({ g })
```

**client.ts**

```ts
import { InferClient, createClient } from '@garph/gqty'
import { createScalarsEnumsHash, createGeneratedSchema } from '@garph/gqty/dist/utils'
import { schema, queryType } from './schema'

type ClientTypes = InferClient<{ query: typeof queryType }>

export const { useQuery, ... } = createClient<ClientTypes>({
  generatedSchema: createGeneratedSchema(schema),
  scalarsEnumsHash: createScalarsEnumsHash(schema),
  url: 'http://localhost:4000/graphql'
})

// Needed for the babel plugin
export { schema as compiledSchema }
```

Using the client (React):

**query.tsx**

```tsx
import { useQuery } from './client'

export default function Example() {
  const query = useQuery()
  return <p>{ query.greet({ name: 'Mish' }) }</p>
}
```

## Using the Babel plugin (alpha)

In production, you might want to use the babel plugin in order to replace the runtime dependencies (such as `generatedSchema`, `scalarsEnumsHash`) in your client config with statically-generated artifacts.

```json
{
  "plugins": [["@garph/gqty/dist/plugin", {
    "clientConfig": "./utils/client.ts"
  }]]
}
```

Where `clientConfig` is the path to the file where you call `createClient`

*Special thanks to Vicary of GQty project for early feedback and helping to make `@garph/gqty` possible*
