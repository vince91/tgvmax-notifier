import * as low from "lowdb";
import { LowdbAsync } from "lowdb";
import * as FileAsync from "lowdb/adapters/FileAsync";

let db: LowdbAsync<Data>;

export async function initDb() {
  db = await low(new FileAsync("data.json"));
  return db
    .defaults<Data>({
      jobs: [],
      lastId: 0,
      lastSent: null,
      userPsid: null,
      origins: null,
      destinations: null
    })
    .write();
}

export function setUserPsid(psid: number) {
  return db.set("userPsid", psid).write();
}

export function getUserPsid() {
  return db.get("userPsid").value();
}

export function setLastSent(date: string) {
  return db.set("lastSent", date).write();
}

export function getLastSent(): string {
  return db.get("lastSent").value();
}

export function setOrigins(origins: string[]) {
  return db.set("origins", origins).write();
}

export function getOrigins(): string[] {
  return db.get("origins").value();
}

export function setDestinations(destinations: string[]) {
  return db.set("destinations", destinations).write();
}

export function getDestinations(): string[] {
  return db.get("destinations").value();
}

export function setJobs(jobs: Job[]) {
  return db.set("jobs", jobs).write();
}

export function getJobs(): Job[] {
  return db.get("jobs").value();
}

export function addJob(job: Job) {
  return db
    .get("jobs")
    .push(job)
    .write();
}

export function removeJob(job: Job) {
  return db
    .get("jobs")
    .remove({ id: job.id })
    .write();
}

export function setJobLastChecked(job: Job, lastChecked: string) {
  return db
    .get("jobs")
    .find(job)
    .assign({ lastChecked })
    .write();
}

export async function getNewId(): Promise<number> {
  await db.update("lastId", id => id + 1).write();
  return db.get("lastId").value();
}

export function getDb(): Data {
  return db.value();
}
