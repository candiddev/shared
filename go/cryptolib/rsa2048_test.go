package cryptolib

import (
	"crypto"
	"encoding/base64"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestRSA2048(t *testing.T) {
	// Generate keys
	prv, pub, err := NewRSA2048()
	assert.Equal(t, err, nil)

	v := []byte("testing")

	got, err := pub.EncryptAsymmetric(v, "123", EncryptionNone)
	assert.Equal(t, err, nil)
	assert.Equal(t, len(got.Ciphertext), 344)
	assert.Equal(t, got.KeyID, "123")

	gotString, err := prv.DecryptAsymmetric(got)
	assert.Equal(t, err, nil)
	assert.Equal(t, gotString, v)

	// Test JavaScript outputs
	prv = RSA2048PrivateKey("MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzXQkWaXZEkiRud1HrrgSSYUqwfYGlsBu1weHakj2DrMJhmhVaGSVM98zeJVTBHn476KSFQKqFly7/46Rjzv09k15A6o8EBKlIKiUctWWRV5YJxFoE0L5+iv2dxc53dsP2n4c31htZ2NdtPL1NL7w0GIjhN1/q1drVedt5IK/4W+pnG8VCq/E2r+LR2whsAoc8jWE+UElu9gazGDbEQlBRN4noKCdwsa+Mqk4JJP0myJkK3R8qUewAEXsrliuRQwKEJzKirviluUiPAtgSMWZ54Mj0LzkNgWJ7t1gVDlaZBjZAXC518e03m5aZn3rrfUKqY8kqJGO4WpsqjeMjKEwXAgMBAAECggEACq/zd6tnCaTvmMlxTyq6SQKVEbkYvYelzwmzbHOkSLFFj80/knPHHjPxuBbfWvZ3LRiqnOoCfx1IBqVIyU2vFzktt46CYQnqEEu6lGBWofdnEEPr3TeW8jFT9U+xArtH5+0PgIs4a/0YsQCagvviKfSAS3MiOvrtJCUzp58D/TdbCZffX++It08/tdHhqclA0hAlwD/FtIU8ZfM6iqFKz9j87DAcXW+LRTfeLFOkuqW8GZKuQrT/dj052cuG7PZTJkCyT03OkIKKRr2CSBFP/7WOjB5OuqT6lBtJtMEwhjTVsMHRdwiEc8owT+3Ujl6Ud+O7eWUJmcy8NB13EXDPeQKBgQC4sTuXNNiz8DBJrNC7hvjhR2zFPoJ1DNPKbKg9dvjQyi33+NOR1CvPyOzYvkwwVthNwyEoHGxb33OZjykVdUZf5u/z0LJfw8TWaGmWy4YeMTRE/k10fKdu7aVRZe1bTwMmKIUqbmrodkZzmP5N2xiZGSpNXuLdHqggaOji2rqEowKBgQD4nRnfRF/hxKHiGufZ7fV7hXxmvbAza/icsn/wAIfhIfYuJUgXpACdsuIDaDp57d4mvqtCScyCWEuJLF1OMat35g9IyO6kZl+Ds6Az3Vh6wua2l31Ha7MghX2/nhdCyStBjMKc6wLjscDn3MK1mysdLdO3HV2E10x4/wcP9Qxd/QKBgG4QsQKba8lQCnbdlkcrWIZomlmxtu0qh8zKlDiM/hrvYhW1I+B0IOfjRcKlJaJpHt64urm8tpbJw4pv1nwDN71PUxBp/uMzN8rOzp4fC/5SNGQpaN9SqjVhSnQH2jvgCnBjFXkD9JI0aifZtTOQrkgOxzb0pR5BdtBZtO/8icshAoGANXoNg6IAgd6695jUAGOYJz66WJs62ITEEGiw7l4e3EVi3+AzFqq3WzSMOzFjSrDo1Sq0Sej37Z2yecoqM9SpTnwVE5HtCz3eE8VCk4VsL9PWrrX9Q6yd9kPgnaQS2tHM1SfDAN/oWjP1C6rH0yqSZo9h+ASABkANegVZboxGYb0CgYBpFpRUPMPSalRF07B0fUTijYm5NiSiLU5AthhOeqi6XbV637MoQgE49A3Tv+j8uzXA91vaQ7jW8LM/3ld1e+QEpFTyMTl0LQ8zestfhuyrOnjkes7Xz1pOwlaSOCJ/p++hSV2tv8uz+tbyVzvnnpUUCADvUktMr/m3HvqVc//MuQ==")
	pub = RSA2048PublicKey("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs10JFml2RJIkbndR664EkmFKsH2BpbAbtcHh2pI9g6zCYZoVWhklTPfM3iVUwR5+O+ikhUCqhZcu/+OkY879PZNeQOqPBASpSColHLVlkVeWCcRaBNC+for9ncXOd3bD9p+HN9YbWdjXbTy9TS+8NBiI4Tdf6tXa1XnbeSCv+FvqZxvFQqvxNq/i0dsIbAKHPI1hPlBJbvYGsxg2xEJQUTeJ6CgncLGvjKpOCST9JsiZCt0fKlHsABF7K5YrkUMChCcyoq74pblIjwLYEjFmeeDI9C85DYFie7dYFQ5WmQY2QFwudfHtN5uWmZ96631CqmPJKiRjuFqbKo3jIyhMFwIDAQAB")
	jsOutput, _ := ParseEncryptedValue(string(EncryptionRSA2048OAEPSHA256) + ":WIuY/t9cIWH/BrUf6FzEGpTD8n5wCYix4Ykf0vNZ2QlQrN9CWACYAddjKPMKFudHSqh12DrWS65M85NdA+g9wMaWtNyJ60SYvyCLmjqdW1sLCHFnRJO+mvBbZZhysbvx3//bhd9MbrKJ/9kE3PCdJ++bEx/QP/npXIErv1mvfV1h7f88uUm2nuT7j3e80hEMa9BY5ajbAJ0yJCUyaHhHn331Q1MhtboehzD1/hHaE/ja6ve6diOR9McsuRMmrj68jmoZcX+lscivGUym1uD8E0/ox2AX92V+mTDZHqjDdbl7KrCTQvOXRb/1Ib2viLhg6hK7kftjBEEUOxV+czGHmQ==")

	got, err = pub.EncryptAsymmetric(v, "", EncryptionNone)
	assert.Equal(t, err, nil)
	assert.Equal(t, len(got.Ciphertext), 344)

	gotString, err = prv.DecryptAsymmetric(got)
	assert.Equal(t, err, nil)
	assert.Equal(t, gotString, v)

	gotString, err = prv.DecryptAsymmetric(jsOutput)
	assert.Equal(t, err, nil)
	assert.Equal(t, gotString, v)

	// Sign/Verify
	m := []byte("hello")

	prv, pub, _ = NewRSA2048()

	sig, err := prv.Sign(m, crypto.SHA256)
	assert.HasErr(t, err, nil)
	err = pub.Verify(m, crypto.SHA256, sig)
	assert.HasErr(t, err, nil)

	// External
	prv = RSA2048PrivateKey("MIIEowIBAAKCAQEApKc8lfc1IXpfAuMu5JhYA7SwKhKthluB+tI+aVFzQjTEwpA9fjUVsxf2XbGxtqppgQzw9MDSYjvFimz7Q4dTTTaAOsbqa6bduM6TJYnuysBGlp3L3SypxyDTEBkIa1mVFtLz5Roya2/kz4i8vA7FiqzP8LJqDPXd8I5ToZYMPTuBaIXORqZO/BMGp5XIRtl076ewCKhCeUK25JSV/aH2gcziKy/aVZ/Fe1C0oEdq3ajWZAp0XUkxBHM5ryheyd72HNkTrZSLVyKmWMUxxAVMoRGmvgJ+WiorUohBcF1ARITFbyejCVzs7eqYmmSdoOM5XRUVxmJkF4IKtC1sB1kiUQIDAQABAoIBAE5UqUQG6SXWG6E6BzMFLsoEidJaNGc43Ws/3iUodJbIl9qf2EFUa9BZ1ADa6lqmU67rQy6NFQlaui2Sjy6fEIgpJ3PO8fLo3Y5v6Bzxs8KNGofI5hWAi/yJpx9/aTv40C6diR4zCk2GW+pHeNJWjK/easZtenpT9ZPdgffbdFMkWpe09FKFPHd37sYwY/6JWdEG6uxZbomQ0ddm5WUoY6xVS57GkerBLNovcBznDm05bLzuB3gbYdKGBrATLBwgFySGkwsXodPT4AL16ffOC6do1GFEHV6wWPQpDU0WY9LFRRT2yN3QwFmIMmbZRLFajcyjkLOl/LAQT0BaPHOOzQkCgYEA0XRO79/d4ZQXkSRC6VOWnkkj+To0naUfZu8UK2WWCN4vppJyKNcA3WcHKj63N3C2uyGj8YqQ6DorZg5O5033l4l9PaJqHd2PiVhftL+4507gCAPSbhw84hdCYUhJz9RhLZrHQBpbBRI7riws8xYjjzfn8pJ8bPnB53YZHTUm54MCgYEAyT47NDGH0NWpEZXJ6UnTcj6GgZbcZDeLakw8V2FD3uLplAtIH6yb/JhqO+X6t+olo3WMU8YAm0+HUelR9/ll1wqIyUUpgB49JXOx29KGEt8bCq8ET3nNoLCn++y63mfSE4iKpCf+jeWhYntj9aqyAjSq1e2TCEKb/7NA2o5hUpsCgYBn9wVfh41I9QslngwgaL8wXjme8cdAIMAPhchLKidoy3B3i+ViZCYnv4YM8AhdWnM5O592u0LmIkl8ZMnBgi/NZg9mUoG9xUYD9Hu86hVLqxkEoXEH+rg1uTnXs9v/bvm1e0g/h1V6lOxOrdq55llMM4HMI+3i4a3fx/z7RHDFJQKBgQCKyEvz9qR/NJnf8rjIFY2on84K2Iss4dFXgTOr3vv7XelPm2glz9fTHxlELZn185f5XjtkGoyYjwP3TTymEmxVHIKwqu2v2Sq6BUuHGWw033+6onAKjylrw+hVKDDG6DpMFkHma151ZQMi841AAnO4abHWznwzmhwS/v+eucoMOQKBgA5QWrE93NDPVK39mAamhxlZJQd6OEM7R18OVZeovg4U2TP9GRQBFGs57VXUK7lDMbTCO7Zscw9IoDSydIFbHeIF48HQwfZ0qiGkGX/yzH7T/z7IYxfvk3F3j7qcJlKvthp/TihvH4q0Ao5uzr3TppyZ6gutgQKXZ9gQhBedpJOi")
	pub = RSA2048PublicKey("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApKc8lfc1IXpfAuMu5JhYA7SwKhKthluB+tI+aVFzQjTEwpA9fjUVsxf2XbGxtqppgQzw9MDSYjvFimz7Q4dTTTaAOsbqa6bduM6TJYnuysBGlp3L3SypxyDTEBkIa1mVFtLz5Roya2/kz4i8vA7FiqzP8LJqDPXd8I5ToZYMPTuBaIXORqZO/BMGp5XIRtl076ewCKhCeUK25JSV/aH2gcziKy/aVZ/Fe1C0oEdq3ajWZAp0XUkxBHM5ryheyd72HNkTrZSLVyKmWMUxxAVMoRGmvgJ+WiorUohBcF1ARITFbyejCVzs7eqYmmSdoOM5XRUVxmJkF4IKtC1sB1kiUQIDAQAB")

	sig, err = prv.Sign(m, crypto.SHA256)
	assert.HasErr(t, err, nil)
	err = pub.Verify(m, crypto.SHA256, sig)
	assert.HasErr(t, err, nil)

	b, _ := base64.StdEncoding.DecodeString("AaraK61VDL1duSOGYwUqRMVSfTMMeSAIe6mxN8/+tpwTWYYcUfwKRob7aONBHKH33rxbiNz09P7ItS7INPf18/MhxhEzIFcSSmPqpZet0qkTU/SJ6MjpZ1x7ibYnFZr93ow2OAjvvZhDepjrH0htketO2UGt0/Nxv1CRBJRVybAPqgsE7hAstTwz5yQkR3FuizupEghYhSDorW4h0V8c9HodovRo6lvHQuHfHsO4fFjAio96PPJqxHolI8vEaitUcsqifuTJUJd05UtkJjwKkZL/iOYjzNFBAbJ7LK/8piGyAc3Kmb6Vf5mE5KP5JsL7TnjSX8vDgK7EWbZjHnOkPg==")
	err = pub.Verify(m, crypto.SHA256, b)
	assert.HasErr(t, err, nil)
}
