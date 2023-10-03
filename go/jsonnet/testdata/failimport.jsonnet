local func = import 'failimport.libsonnet';

[
  func.testdata(false, 1),
  func.testdata(true, 2),
]
