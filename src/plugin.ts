import TSimport from 'ts-import'
import { resolve } from 'path'
import t from '@babel/types'
import serialize from 'babel-literal-to-ast'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'

export function GarphGQtyPlugin(_, { clientConfig }) {
  return {
    visitor: {
      CallExpression(path, state) {
        if (state.file.opts.filename !== resolve(clientConfig)) return
        if (path.node.callee.name !== 'createClient') return

        const module = TSimport.loadSync(state.file.opts.filename)

        const schema = module.compiledSchema
        const generatedSchema = createGeneratedSchema(schema)
        const scalarsEnumsHash = createScalarsEnumsHash(schema)

        const deleteIndex = path.node.arguments[0].properties.findIndex(p => p.key.name === 'schema')
        path.node.arguments[0].properties[deleteIndex] = undefined
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
