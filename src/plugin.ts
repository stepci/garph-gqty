import * as TSimport from 'ts-import'
import { resolve } from 'path'
import * as t from '@babel/types'
import serialize from 'babel-literal-to-ast'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'

export function GarphGQtyPlugin(_, { clientConfig }) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (state.file.opts.filename !== resolve(clientConfig)) return
        if (path.node.callee.name !== 'createClient') return

        const module = TSimport.loadSync(state.file.opts.filename, {
          mode: TSimport.LoadMode.Compile
        })

        const schema = module.compiledSchema
        const generatedSchema = createGeneratedSchema(schema)
        const scalarsEnumsHash = createScalarsEnumsHash(schema)

        path.node.arguments[0].properties = path.node.arguments[0].properties.filter(p => p.key.name !== 'schema')
        path.node.arguments[0].properties.push(
          t.objectProperty(t.identifier('generatedSchema'), serialize(generatedSchema))
        )

        path.node.arguments[0].properties.push(
          t.objectProperty(t.identifier('scalarsEnumsHash'), serialize(scalarsEnumsHash))
        )
      }
    }
  }
}