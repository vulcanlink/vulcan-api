import { ApolloServer } from 'apollo-server'
import schema from './schema'
import { createContext } from './context'

new ApolloServer({ schema, context: createContext }).listen(
    { port: 4002 },
    () =>
        console.log(
            `🚀 Server ready at: http://localhost:4002`,
        ),
)
