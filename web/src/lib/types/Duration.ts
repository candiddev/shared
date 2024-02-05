export const Duration = {
  toString(duration?: number): string {
    let time = "";

    if (duration === undefined || duration === 0) {
      return "0m";
    }
    let minutes = duration;

    // One day
    if (duration >= 1440) {
      const days = Math.floor(minutes / 1440);
      time += `${days}d `;
      minutes -= days * 1440;
    }

    // One hour
    if (duration >= 60) {
      const hours = Math.floor(minutes / 60);
      time += `${hours}h `;
      minutes -= hours * 60;
    }

    time += `${minutes}m`;
    return time;
  },
};
