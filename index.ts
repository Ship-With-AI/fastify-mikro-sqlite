import { type EntityManager, EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import fastifyPlugin from "fastify-plugin";

interface Options {
  dbName: string
  migrationsPath: string
  migrationsPathTs: string
  entities: EntitySchema[]
}

export default fastifyPlugin<Options>(
  async (fastify, opts) => {
    const orm = await MikroORM.init({
      dbName: opts.dbName,
      migrations: {
        path: opts.migrationsPath,
        pathTs: opts.migrationsPathTs
      },
      entities: opts.entities,
    });
    fastify.decorateRequest("em", {
      getter: () => orm.em.fork(),
    });
    fastify.addHook("onClose", async () => {
      return await orm.close();
    });

    return await orm.migrator.up();
  },
  {
    name: "fastify-mikro-sqlite",
  },
);

declare module "fastify" {
  interface FastifyRequest {
    em: EntityManager;
  }
}
