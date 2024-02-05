import { Clone } from "../utilities/Clone";

export interface DataPosition {
  /** ID of the object. */
  id: NullUUID;

  /** Position of the object. */
  position: string;
}

export class Position {
  static adjacent<T extends DataPosition>(
    target: T,
    list: T[],
    before: boolean,
  ): string {
    const items = Position.sort(list);

    if (items.length > 0) {
      const i = items.findIndex((child) => {
        return child.id === target.id;
      });

      if (before) {
        if (i !== 0) {
          return Position.between(list[i - 1].position, list[i].position);
        }

        return Position.increase(items[i].position, false);
      }

      if (i + 1 !== items.length) {
        return Position.between(items[i].position, items[i + 1].position);
      }

      return Position.increase(items[i].position, true);
    }

    return Position.increase(target.position, true);
  }

  static between(topPosition: string, bottomPosition: string): string {
    const intTop = topPosition.split(":")[0];
    const intBot = bottomPosition.split(":")[0];
    const posTop = topPosition.split(":")[1];
    const posBot = bottomPosition.split(":")[1];

    if (
      intTop === intBot &&
      posTop !== undefined &&
      (posBot === undefined ||
        (posTop.length > posBot.length &&
          posTop.substr(0, posBot.length) === posBot) ||
        (posTop.length < posBot.length &&
          posBot.substr(0, posTop.length) === posTop))
    ) {
      return topPosition.replace(
        /.$/,
        String.fromCharCode(topPosition.charCodeAt(topPosition.length - 1) + 1),
      );
    }

    return this.increase(bottomPosition, false);
  }

  static increase(position: string, incrementNumber: boolean): string {
    if (incrementNumber) {
      const number = parseInt(position.split(":")[0], 10);
      return `${number + 1}`;
    } else if (position.includes(":")) {
      return `${position}a`;
    }
    return `${position}:a`;
  }

  static sort<T extends DataPosition>(input: T[]): T[] {
    const list = Clone(input);
    list.sort((a, b) => {
      const intA = parseInt(a.position.split(":")[0], 10);
      const intB = parseInt(b.position.split(":")[0], 10);
      if (intA < intB) {
        return -1;
      } else if (intA > intB) {
        return 1;
      } else if (intA === intB) {
        const posA = a.position.split(":")[1];
        const posB = b.position.split(":")[1];
        if (posA === undefined) {
          return 1;
        } else if (posB === undefined) {
          return -1;
        } else if (posA.length === posB.length) {
          if (posA < posB) {
            return -1;
          } else if (posA > posB) {
            return 1;
          }
        } else if (posA.length > posB.length) {
          if (posA.substr(0, posB.length) > posB) {
            return 1;
          }
          return -1;
        } else if (posA.length < posB.length) {
          if (posA < posB.substr(0, posA.length)) {
            return -1;
          }
          return 1;
        }
      }
      return 0;
    });

    return list;
  }
}
