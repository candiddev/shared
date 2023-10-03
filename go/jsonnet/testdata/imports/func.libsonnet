{
  testdata(bool, int):: {
    String: std.stripChars(if int == 1 then importstr "text.txt" else importstr "../otherDir/more.txt", "\n"),
    Bool: bool,
    Int: int,
  }
}
