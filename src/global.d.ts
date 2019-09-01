import * as moment from 'moment';

declare global {
  interface Data {
    jobs: Job[];
    lastId: number;
    userPsid: number;
    origins: string[];
    destinations: string[];
    lastSent: moment.Moment;
  }

  interface Job {
    id: number;
    origin: string;
    destination: string;
    date: string;
    lastChecked: string;
    checking: boolean;
  }
}
