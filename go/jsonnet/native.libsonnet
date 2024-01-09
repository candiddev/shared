{
  getArch(): std.native('getArch')(),
  getConfig(): std.native('getConfig')(),
  getEnv(key, fallback=null): std.native('getEnv')(key, fallback),
  getFile(path, fallback=null): std.native('getFile')(path, fallback),
  getOS(): std.native('getOS')(),
  getPath(): std.native('getPath')(),
  getRecord(type, name, fallback=null): std.native('getRecord')(type, name, fallback),
  randStr(length): std.native('randStr')(length),
  regexMatch(regex, string): std.native('regexMatch')(regex, string),
  render(string): std.native('render')(string),
}
