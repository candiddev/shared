import { CSV } from "./CSV";

test("CSV", async () => {
  const input = `
Account Type: Checking
Account Number: 123456
Date Range: 4/1/2022 - 4/10/2022

Transaction Type,Date,Description,Memo,Amount,Balance,Check Number
Other,4/1/2022,Debit Card,Cellphone provider,-42.76,957.24,
`;

  expect(await CSV.getHeaders(input)).toStrictEqual([
    "Transaction Type",
    "Date",
    "Description",
    "Memo",
    "Amount",
    "Balance",
    "Check Number",
  ]);
});
