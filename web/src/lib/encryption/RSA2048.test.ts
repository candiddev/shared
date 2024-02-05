import {
  NewRSA2048Key,
  rsa2048OAEPDecrypt,
  rsa2048OAEPEncrypt,
} from "./RSA2048";

test("RSA2048", async () => {
  const key = (await NewRSA2048Key()) as {
    privateKey: string;
    publicKey: string;
  };

  const input = "testing";

  let output = (await rsa2048OAEPEncrypt(key.publicKey, input)) as string;
  expect(output).toHaveLength(344);

  output = (await rsa2048OAEPDecrypt(key.privateKey, output)) as string;
  expect(output).toBe(input);

  // Test Go outputs
  key.privateKey =
    "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDVV24nrCPeT7jMRzNJvsfqsWkgcYNu27dkWdwWZuQ2yExLDq72MsxB3uojFtNuWaQZiv3yZMa6zTORuu/6I0EvOdxWvxekQX++32eoYree8GLiKnWpJGWXgnIUhJpbAvu1bXCR74lGmcVH/HnohytjkADWQkkAcXsx0QNLxzuA3ItahJyT4Pc9N04MqGRUJaDre7DnXb8mMZb8bK2oiinc/+wG+5ZbvTeiUPKFTUbIhKodt9724qzY/OvpeZH63VYPjzcl+3lyIIy4EDaOuC0lvgTmoRQZZTIMwryTHK/+qQB/S1Wm4Q7/Cg7nbvQcchw2MvFmtf1S3dGlDVQEyffRAgMBAAECggEBANAou6FX87NxY+Vlv2RAEv4q1mFCgLSFC16N0xHEmP3e15oQnKQ6ElRfNWLBXdD5BAWsOXXt4H3ZxGx30rjk9zAmK5g0YdPx2LwbbR++Gl2pPUJhnWZIzhtTuw3MCHOu6HwwaTrrVq0dUoGXljdM1AgUNMzZ5jLZhxOnVaj1n1htj+6+joKvcsqvozlyAgLfkR7qsyAeA3E0Nn6nJ1R9FLet8fdYhllAInywfocn/mTVCtNhrcuYsf1r0QviDbtORMFNPaz5TAVwUH/lvd6xlGyEaMqgCq+DDNIO41HBpcm+qilkQIL8484kNtPKIveFpyq5ng3rUSC70zHGA5Or2nECgYEA8jgBpLPseIrHRZHUvecUFfoq2wmjd0hR7rpblBlXm+GvzaovhdDeFP4HcjAVNu3cBjO61UwPaxECpYbAb9WpMAIO1pXrYi1eJHm9sFeUazaaewXl2+tOK1cumAO4+WqUwMKHFdl0zuP/vwQI8FSPZCmNYXaw9WK6YZ9FtfNrqLUCgYEA4XrRSVsa5N1Bt7nfO/aJTkGtc2oMNXpfn9r6x93Y8NbwZdOlMknSYJ2fGA+Ic+u7T0iZhwzIj7lDAvcDo5I0k6cT1P5zJ/Ku+5XRC8KqcNohIqILzrYQWN4SFeWdoPhlPzh/0JcDtZtCJe6k8RsqrZMr05bt+qBbqYWHWUxKEC0CgYA2q31zd0jATFJ92VRzKFzYOQbDOYGzwpb7kwRogO/NNzs+6FKhmWsGwe9cTo37P+SRYcuhqPEx8Tzvr2Jv24G8XDqNJHlkR2kgQnoV+y58pG5ppgMjiBC0p5DUrsJpSS0Z9M4YmGRM7hkjO/3ogK18pgRLI0b9m7MFpbVORArgoQKBgAOJbab86tsULWe4XqwOHfFATnw0+aQNG1rikHR6ImEEvhiazUiQp+AkGM7Dz5wh4npH5UCdDrhSa56sST5TmMeII2N/6kaCJASGQRUyJIJIqaRlblH7wR3jvdziESrpOo1XUYnwFHrQyKTXrXaqumymllVnVKxNv6JVGd5ot/CxAoGAO1WZaipRroKfw2DTn+SqzYiZWGr5D/RKE8g2kyIrtzSQEFn5hYAopJsKe9uMmuM2+tST0drSsJLyJ+f4vX4OtvYf/9ybeAwdUa1Bn+r31zzFgvlnRuTKqxYFaUsdyhgbWxDJmmMIszYGoUyDCpBTqDtEMVFvwwgit8ioFTHNFK8=";
  key.publicKey =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1VduJ6wj3k+4zEczSb7H6rFpIHGDbtu3ZFncFmbkNshMSw6u9jLMQd7qIxbTblmkGYr98mTGus0zkbrv+iNBLzncVr8XpEF/vt9nqGK3nvBi4ip1qSRll4JyFISaWwL7tW1wke+JRpnFR/x56IcrY5AA1kJJAHF7MdEDS8c7gNyLWoSck+D3PTdODKhkVCWg63uw512/JjGW/GytqIop3P/sBvuWW703olDyhU1GyISqHbfe9uKs2Pzr6XmR+t1WD483Jft5ciCMuBA2jrgtJb4E5qEUGWUyDMK8kxyv/qkAf0tVpuEO/woO5270HHIcNjLxZrX9Ut3RpQ1UBMn30QIDAQAB";
  const goOutput =
    "lvhMxKGaKzkUtZE2mhzAc6bD2qfaySflKmHC8zdLeG3kce7LiHppI/5xL4FauRZItJ/Bukb8Z3njOGGqkzu3kBEgE5PD/B5qO5odWjYDOPMc17iqJdWUm9Ifdpltokr4hsE0LnvoA6OP9ArbrOOUjt6TrNIk5mBWOz9VyUmbnEbzRqAkyYGycbTnDbLr2PTWB4vm9JxHsjd3D6C3sus9eLhvwjhTlq81QeeEn3YqfFVwXAKC4JH/sI+Ep9lh03o9tBkNHiBt7Sm/lIasLLd3u/C8dS3NgFaJXD0TzCuujVsjhorN3bR+YFIzfk8w5sT2lDURfe6Wie1ex9VRJYx2TQ==";

  output = (await rsa2048OAEPEncrypt(key.publicKey, input)) as string;
  expect(output).toHaveLength(344);

  output = (await rsa2048OAEPDecrypt(key.privateKey, output)) as string;
  expect(output).toBe(input);

  output = (await rsa2048OAEPDecrypt(key.privateKey, goOutput)) as string;
  expect(output).toBe(input);
});
