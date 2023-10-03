local func = import '../../jsonnet/testdata/imports/func.libsonnet';
local n = import '../native.libsonnet';

func.testdata(false, 1) + {
  String: n.getPath(n.getEnv("ts")+"/test#a:b\r\na:c\r\nc:d"),
}
