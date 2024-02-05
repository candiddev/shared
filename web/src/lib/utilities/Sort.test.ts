import { Sort } from "./Sort";

test("Sort", () => {
  const input = [
    {
      data: "b",
      test: 1,
    },
    {
      a: "a",
      data: "c",
      test: 2,
    },
    {
      data: "d",
      test: 1,
    },
    {
      a: "b",
      data: "a",
      test: 2,
    },
  ];
  /*const output = [
		{
			data: "b",
			test: 1,
		},
		{
			data: "d",
			test: 1,
		},
		{
			a: "b",
			data: "a",
			test: 2,
		},
		{
			a: "a",
			data: "c",
			test: 2,
		},
	];
	const invertOutput = [
		{
			data: "d",
			test: 1,
		},
		{
			a: "a",
			data: "c",
			test: 2,
		},
		{
			data: "b",
			test: 1,
		},
		{
			a: "b",
			data: "a",
			test: 2,
		},
	];*/
  const outputA = [
    {
      a: "a",
      data: "c",
      test: 2,
    },
    {
      a: "b",
      data: "a",
      test: 2,
    },
    {
      data: "b",
      test: 1,
    },
    {
      data: "d",
      test: 1,
    },
  ];
  const invertOutputA = [
    {
      a: "b",
      data: "a",
      test: 2,
    },
    {
      a: "a",
      data: "c",
      test: 2,
    },
    {
      data: "b",
      test: 1,
    },
    {
      data: "d",
      test: 1,
    },
  ];
  /*
	Sort(input, {
		property: "data",
	});
	Sort(input, {
		property: "test",
	});
	expect(input)
		.toStrictEqual(output);
	Sort(input, {
		invert: true,
		property: "data",
	});
	expect(input)
		.toStrictEqual(invertOutput);
	Sort(input, {
		property: "data",
	});
	Sort(input, {
		property: "test",
	});
	expect(input)
		.toStrictEqual(output);*/
  Sort(input, {
    property: "a",
  });
  expect(input).toStrictEqual(outputA);
  Sort(input, {
    invert: true,
    property: "a",
  });
  expect(input).toStrictEqual(invertOutputA);
});

/*test("Sorts arrays correctly", () => {
	const input = [
		"a",
		"c",
		"b",
	];
	const output = [
		"a",
		"b",
		"c",
	];
	const invertOutput = [
		"c",
		"b",
		"a",
	];
	Sort(input);
	expect(input)
		.toStrictEqual(output);
	Sort(input, {
		invert: true,
	});
	expect(input)
		.toStrictEqual(invertOutput);
	Sort(input);
	expect(input)
		.toStrictEqual(output);
});*/
