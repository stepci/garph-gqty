import { Schema, ScalarsEnumsHash } from 'gqty'
import { SchemaUnionsKey } from 'gqty'
import { GraphQLSchema, GraphQLNamedType, isScalarType, isEnumType, isUnionType, GraphQLObjectType, isObjectType } from 'graphql'

function filteredTypes (types: readonly GraphQLNamedType[], exclude: string[] = []) {
  return types.filter((type) => !type.name.startsWith('__'))
}

export function createScalarsEnumsHash (schema: GraphQLSchema) {
  const scalarsEnumsHash: ScalarsEnumsHash = {}

  filteredTypes(schema.toConfig().types).forEach((type) => {
    if (isScalarType(type) || isEnumType(type)) {
      scalarsEnumsHash[type.name] = true
    }
  })

  return scalarsEnumsHash
}

export function createGeneratedSchema(schema: GraphQLSchema) {
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

  filteredTypes(schema.toConfig().types).forEach((type) => {
    if (type.name === "Query" || type.name === "Mutation" || type.name === "Subscription") {
      type.name = type.name.toLowerCase()
    }

    if (isUnionType(type)) {
      generatedSchema[type.name as string] = {
        __typename: { __type: "String!" },
        $on: { __type: `$${type.name}!` }
      }

      generatedSchema[SchemaUnionsKey][type.name] = type.getTypes().map((value) => value.name)
    } else if (isObjectType(type)) {
      generatedSchema[type.name] = {
        __typename: { __type: "String!" }
      }

      Object.values((type as GraphQLObjectType).getFields()).forEach((field) => {
        generatedSchema[type.name][field.name] = {
          __type: field.type.toString(),
          __args: field.args.length > 0 ? field.args.reduce((acc, arg) => {
            acc[arg.name] = arg.type.toString()
            return acc
          }, {} as Record<string, string>) : undefined
        }
      })
    }
  })

  return generatedSchema
}
