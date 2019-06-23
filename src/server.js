import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { authenticate } from './utils/auth'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `

    interface Animal {
      species: String!
    }

    type Lion implements Animal {
      species: String!
      color: String
    }

    type Tiger implements Animal {
      species: String!
      stringCount: Int
    }

    type Query {
      animals: [Animal]
    }

    schema {
      query: Query
    }
  `
  // const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    // typeDefs: [rootSchema, ...schemaTypes],
    typeDefs: [rootSchema],
    resolvers: {
      Query: {
        animals() {
          return [
            {
              species: 'Lion',
              color: 'red'
            },
            {
              species: 'Tiger'
            }
          ]
        }
      },
      Animal: {
        __resolveType(animal){
          return animal.species
        }
      }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
