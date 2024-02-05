interface UpdateableData {
  updated?: NullTimestamp;
}

export function FindLastUpdated(
  data?: UpdateableData | UpdateableData[],
): NullTimestamp | undefined {
  if (data === undefined) {
    return;
  }

  if (!Array.isArray(data)) {
    return data.updated;
  }

  if (data.length === 0) {
    return;
  }

  return data.reduce((previous: UpdateableData, current: UpdateableData) => {
    if (previous.updated === undefined || previous.updated === null) {
      return current;
    }
    if (current.updated === undefined || current.updated === null) {
      return previous;
    }
    return previous.updated > current.updated ? previous : current;
  }).updated;
}
