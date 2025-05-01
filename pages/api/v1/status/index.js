import database from "infra/database.js";

export default async function status(request, response) {
  const update_at = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseMaxOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseMaxOpenedConnectionsValue =
    databaseMaxOpenedConnectionsResult.rows[0].count;

  response.status(200).json({
    update_at: update_at,
    database: {
      dependencies: {
        version: databaseVersionValue,
        max_connections: databaseMaxConnectionsValue,
        opened_connections: databaseMaxOpenedConnectionsValue,
      },
    },
  });
}
