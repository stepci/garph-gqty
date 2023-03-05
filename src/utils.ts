import { AnyType } from 'garph'
import { getFieldType } from 'garph/dist/schema'
import { Schema, ScalarsEnumsHash } from 'gqty'
import { SchemaUnionsKey } from 'gqty'

export function createScalarsEnumsHash (types: AnyType[]) {
  const scalarsEnumsHash: ScalarsEnumsHash = {
    Int: true,
    Float: true,
    String: true,
    Boolean: true,
    ID: true
  }

  for (const type of types) {
    if (type.typeDef.type === "Scalar" || type.typeDef.type === "Enum") {
      scalarsEnumsHash[type.typeDef.name as string] = true
    }
  }

  return scalarsEnumsHash
}

export function createGeneratedSchema (types: AnyType[]) {
  const generatedSchema: Schema = {
    query: {
      __typename: { __type: "String!" }
    },
    mutation: {
      __typename: { __type: "String!" }
    },
    subscription: {
      __typename: { __type: "String!" }
    },
    [SchemaUnionsKey]: {}
  }

  for (const type of types) {
    if (type.typeDef.type === "ObjectType" || type.typeDef.type === "InterfaceType" || type.typeDef.type === "Union") {
      if (type.typeDef.name === "Query" || type.typeDef.name === "Mutation" || type.typeDef.name === "Subscription") {
        type.typeDef.name = type.typeDef.name.toLowerCase()
      }

      generatedSchema[type.typeDef.name as string] = {
        __typename: { __type: "String!" }
      }

      if (type.typeDef.type === "Union") {
        generatedSchema[type.typeDef.name as string] = {
          __typename: { __type: "String!" },
          $on: { __type: `$${type.typeDef.name}!` }
        }

        generatedSchema[SchemaUnionsKey][type.typeDef.name] = Object.values(type.typeDef.shape).map((value: any) => value.typeDef.name)
      } else {
        Object.entries(type.typeDef.shape).forEach(([key, value]: [string, any]) => {
          const args: Record<string, any> = {}

          generatedSchema[type.typeDef.name as string][key] = {
            __type: getFieldType(value, { defaultNullability: false }),
          }

          if (value.typeDef.args) {
            Object.entries(value.typeDef.args).forEach(([key, value]: [string, any]) => {
              args[key] = getFieldType(value, { defaultNullability: false })
            })

            generatedSchema[type.typeDef.name as string][key]['__args'] = args
          }
        })
      }
    }
  }

  return generatedSchema
}
