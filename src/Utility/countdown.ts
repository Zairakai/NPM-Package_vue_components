export interface Remaining {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** What is left until a target, in whole seconds, never below zero. */
export function remaining(target: number, now: number): Remaining {
  const total = Math.max(0, Math.floor((target - now) / 1000))

  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

/** The ISO 8601 duration of a remaining time, for the datetime attribute of <time>: P1DT2H3M4S. */
export function isoDuration(value: Remaining): string {
  const date = 0 < value.days ? `${value.days}D` : ''

  return `P${date}T${value.hours}H${value.minutes}M${value.seconds}S`
}

/** The time of a target given as a date, a timestamp or an ISO string. NaN when it is not one. */
export function toTime(target: Date | number | string): number {
  return target instanceof Date ? target.getTime() : 'number' === typeof target ? target : new Date(target).getTime()
}
