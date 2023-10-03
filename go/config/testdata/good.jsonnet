local f = import '../../jsonnet/native.libsonnet';

local cmd(path) = {
  exec: f.getConfig().app.lists[0],
  path: path
};
local vault = std.parseJson(f.getPath(f.getEnv('VAULT_ADDR'))).data;

{
  app: {
    arg1: 'a',
    env: f.getEnv('ENV'),
    debug: true,
    listEl: if std.length(f.getConfig().app.lists) > 0 then f.getConfig().app.lists[1],
    lists: [
      'this',
      'that'
    ],
    postgreSQLUsername: vault.postgresql_username,
    vault: vault,
  },
  commands: [
    cmd('this'),
    cmd('that')
  ],
  path: [
    {
      something: 'that'
    }
  ],
  vars: {
    test: false
  }
}
