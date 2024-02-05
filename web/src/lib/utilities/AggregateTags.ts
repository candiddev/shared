import { Telemetry } from "@lib/services/Telemetry";

import { Sort } from "./Sort";

export interface DataTags {
  /** Timestamp for when item was deleted. */
  deleted?: NullTimestamp;

  /** A list of tags for the item. */
  tags: null | string[];
}

export function AggregateTags<T extends DataTags>(objects: T[]): Tag[] {
  Telemetry.spanStart("AggregateTags");

  const tags: Tag[] = [];

  for (const object of objects) {
    if (
      object.tags !== null &&
      (object.deleted === null || object.deleted === undefined)
    ) {
      for (let tagList of object.tags) {
        let existingTag = false;
        for (const tag of tags) {
          if (tagList === "") {
            tagList = "none";
          }
          if (tag.name === tagList) {
            tag.count++;
            existingTag = true;
            break;
          }
        }
        if (!existingTag) {
          tags.push({
            count: 1,
            name: tagList,
          });
        }
      }
    }
  }
  Sort(tags, {
    property: "name",
  });
  Telemetry.spanEnd("AggregateTags");

  return tags;
}
