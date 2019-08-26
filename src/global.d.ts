interface Data {
  jobs: Job[];
  lastId: number;
  userPsid: number;
  origins: string[];
  destinations: string[];
}

interface Job {
  id: number;
  origin: string;
  destination: string;
  date: string;
  lastChecked: string;
  checking: boolean;
}
