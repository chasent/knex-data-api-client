const knexClientFactory = require('knex');

function format(sql, bindings, dialect) {
  const knexClient = knexClientFactory({ client: dialect });

  const stringBindings = bindings
    ? bindings.map((binding) => {
        if (!binding) {
          return binding;
        }

        if (binding instanceof Date) {
          return binding.toISOString().slice(0, 19).replace('T', ' ');
        } else if (binding instanceof Object) {
          return JSON.stringify(binding);
        }

        return binding;
      })
    : bindings;

  if (dialect === 'mysql') {
    return knexClient.raw(sql, stringBindings).toString();
  }

  return knexClient
    .raw(
      sql.replace(/`/g, '"').replace(/"[^"]*"|(\$\d+)/g, (match, $1) => {
        if ($1) {
          return '?';
        }
        return match;
      }),
      stringBindings,
    )
    .toString();
}

module.exports = {
  format,
};
