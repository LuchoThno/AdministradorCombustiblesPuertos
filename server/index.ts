import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { config } from './config.js';
import { connectDatabase } from './db.js';
import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';
import { seedDemoData } from './seed.js';
import { getUserFromAuthorization } from './auth.js';

async function bootstrap() {
  await connectDatabase();

  if (config.seedDemoData) {
    await seedDemoData();
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: config.port },
    context: async ({ req }) => ({
      user: await getUserFromAuthorization(req.headers.authorization),
    }),
  });

  console.log(`GraphQL API ready at ${url}`);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
