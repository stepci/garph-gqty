import * as TSimport from 'ts-import'
import { resolve } from 'path'
import serialize from 'babel-literal-to-ast'
import { createGeneratedSchema, createScalarsEnumsHash } from './utils'

export default function GarphGQtyPlugin(_, { clientConfig }) {
  return {
    visitor: {
      ExportNamedDeclaration(path, state) {
        if (state.file.opts.filename !== resolve(clientConfig)) return
        if (path.node.specifiers.find(s => s.exported.name === 'compiledSchema')) {
          path.node.specifiers = []
        }
      },
      CallExpression(path, state) {
        if (state.file.opts.filename !== resolve(clientConfig)) return
        if (path.node.callee.name !== 'createClient') return

        const module = TSimport.loadSync(state.file.opts.filename, {
          mode: TSimport.LoadMode.Compile
        })

        const schema = module.compiledSchema
        const generatedSchema = createGeneratedSchema(schema)
        const scalarsEnumsHash = createScalarsEnumsHash(schema)

        path.node.arguments[0].properties.find(p => p.key.name === 'generatedSchema').value = serialize(generatedSchema)
        path.node.arguments[0].properties.find(p => p.key.name === 'scalarsEnumsHash').value =  serialize(scalarsEnumsHash)
      }
    }
  }
}
