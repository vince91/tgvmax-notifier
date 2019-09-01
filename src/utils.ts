import * as moment from "moment";

export function jobToString({
  origin,
  destination,
  date,
  id,
  lastChecked
}: Job): string {
  return `${origin} -> ${destination} on ${date} (id: ${id}, lastChecked: ${
    lastChecked ? moment(lastChecked).format("YYYY-MM-DD HH:mm") : "N/A"
  })`;
}

export function log(...text: string[]) {
  console.log(moment().format(), ...text);
}

export function logError(...text: string[]) {
  console.log(moment().format(), ...text);
}