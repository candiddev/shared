{
  getConfig(): std.native('getConfig')(),
  getEnv(key, fallback=null): std.native('getEnv')(key, fallback),
  getPath(path, fallback=null): std.native('getPath')(path, fallback),
  getRecord(type, name, fallback=null): std.native('getRecord')(type, name, fallback),
  randStr(length): std.native('randStr')(length),
  regexMatch(regex, string): std.native('regexMatch')(regex, string),
  render(string): std.native('render')(string),
}
