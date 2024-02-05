import type { DataPosition } from "../types/Position";
import { Position } from "../types/Position";
import { Clone } from "./Clone";

interface DataParentID {
  children?: DataParentID[];
  deleted?: NullTimestamp;
  id: NullUUID;
  parentID: NullUUID;
  position?: string;
}

export interface FilterSortChildrenArguments<T extends DataParentID> {
  /** Input to filter and sort. */
  input: T[];

  /** Optional rootID to start filtering from. */
  rootID?: NullUUID;
}

function filterChildren<T extends DataParentID>(
  parentID: NullUUID,
  input: T[],
): T[] {
  const output = [];
  let i = input.length;
  while (i-- >= 0) {
    if (input[i] !== undefined && input[i].parentID === parentID) {
      if (input[i].deleted !== undefined && input[i].deleted !== null) {
        input.splice(i, 1);
        continue;
      }

      const e = Clone(input[i]);
      input.splice(i, 1);
      e.children = filterChildren(e.id, input);
      output.push(e);
    }
  }

  if (output.length > 0 && output[0].position !== undefined) {
    return Position.sort(output as DataPosition[]) as T[];
  }

  return output;
}

export function FilterSortChildren<T extends DataParentID>(
  args: FilterSortChildrenArguments<T>,
): T[] {
  const data = Clone(args.input);
  let output: T[] = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].deleted !== undefined && data[i].deleted !== null) {
      data.splice(i, 1);
      i--;
      continue;
    }

    if (
      (args.rootID === undefined && data[i].parentID === null) ||
      data[i].id === args.rootID
    ) {
      const j = output.push(data[i]);
      data.splice(i, 1);
      i--;

      const oldLength = data.length;
      output[j - 1].children = filterChildren(output[j - 1].id, data);
      i = Math.max(i - (oldLength - data.length), -1);
    }
  }

  if (args.rootID === undefined) {
    // For some reason we have any loops, add them to the root
    output = output.concat(data);
  }

  if (output.length > 0 && output[0].position !== undefined) {
    return Position.sort(output as DataPosition[]) as T[];
  }

  return output;
}
