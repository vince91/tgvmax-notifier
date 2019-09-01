interface Data {
  jobs: Job[];
  lastId: number;
  userPsid: number;
  origins: string[];
  destinations: string[];
  lastSent: string;
}

interface Job {
  id: number;
  origin: string;
  destination: string;
  date: string;
  lastChecked: string;
}
