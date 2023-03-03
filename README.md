# @garph/gqty

tRPC-style client for [Garph](https://github.com/stepci/garph), based on [GQty](https://github.com/gqty-dev/gqty)

```
npm i @garph/gqty
```

Example:

```ts
import { g } from 'garph'
import { InferClient, createClient } from '@garph/gqty'

export const queryType = g.type('Query', {
  greet: g.string()
    .args({
      name: g.string().optional().default('Max'),
    })
    .description('Greets a person')
})

type ClientTypes = InferClient<{ query: typeof queryType }>

export const { useQuery } = createClient<ClientTypes>({
  schema: g,
  url: 'http://localhost:4000/graphql'
})
```

Using the client (React):

```tsx
import { useQuery } from './client'

export default function Example() {
  const query = useQuery()
  return <p>{ query.greet({ name: 'Mish' }) }</p>
}
```

### Acknowledgements

- tRPC for inspiration
- Vicary of GQty project for early feedback and helping to make `@garph/gqty` possible
