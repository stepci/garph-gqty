export const generatedSchema = {
  User: {
    __typename: { __type: "String!" },
    age: { __type: "Int!" },
    friends: { __type: "[User!]!" },
    id: { __type: "Float!" },
    name: { __type: "String!" },
  },
  mutation: {
    __typename: { __type: "String!" },
    greet: { __type: "String!", __args: { name: "String" } },
  },
  query: {
    __typename: { __type: "String!" },
    greet: { __type: "String!", __args: { name: "String" } },
    user: { __type: "User!" },
  },
  subscription: {
    __typename: { __type: "String!" },
    counter: { __type: "Int!" },
  },
}
