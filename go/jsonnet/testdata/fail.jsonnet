local func = import 'fail.libsonnet';

[
  func.testdata(false, 1),
  func.testdata(true, 2),
]
