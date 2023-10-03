local func = import '../functions.libsonnet';

[
  {
    String: func.getRecord('cname', 'vault.candid.dev')
  },
]
