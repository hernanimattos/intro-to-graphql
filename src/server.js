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
    union Result = Book | Author

    type Book {
      title: String
      author: Author
    }

    type Author {
      title: String
      name: String
      book: [Book]
    }

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
      search: [Result]
      book: Book
      author: Author
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
        book() {
          return {}
        },
        author() {
          return {}
        },
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
        },
        search() {
          return [
            {
              title: 'teste'
            },
            {
              title: 'e nois',
              name: 'Titulo'
            }
          ]
        },
        // exmplo de querie

      },
      Animal: {
        __resolveType(animal) {
          return animal.species
        }
      },
      Result: {
        __resolveType(obj, context, info) {
          if (obj.name) {
            return 'Author'
          }

          if (obj.title) {
            return 'Book'
          }
        }
      },
      Author: {
        name() {
          return 'nome do author'
        }
      },
      Book: {
        title() {
          return 'title'
        },
        author() {
          return {}
        }
      }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
