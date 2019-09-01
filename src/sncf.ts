import axios from "axios";
import * as he from "he";
import * as moment from "moment";
import { log } from "./utils";
import { setDestinations, setOrigins } from "./data";

let axiosInstance = axios.create();
let token: string;
let tokenPromise: Promise<void>;
let tokenValidUntil: moment.Moment;

const SIMULATOR_URL = "https://simulateur.tgvmax.fr/VSC/";
const API_URL = "https://sncf-simulateur-api-prod.azurewebsites.net/api";
const ORIGIN_URL = API_URL + "/Stations/AllOrigins";
const DESTINATION_URL = API_URL + "/Stations/AllDestinations";
const AVAILABILITY_URL = API_URL + "/RailAvailability/Search";
const FORMAT = "YYYY-MM-DDTHH:mm:ss";

export function checkToken() {
  if (token == null || moment().isAfter(tokenValidUntil)) {
    tokenValidUntil = moment().add(55, "minute");
    tokenPromise = getToken();
  }

  return tokenPromise;
}

async function getToken() {
  log("Retrieving TGVmax token...");

  const { data: response } = await axios(SIMULATOR_URL);
  const inputs = (response as string).match(/<input(?:.*)\/>/g);
  const tokenInput = inputs.find(input => input.includes("hiddenToken"));

  token = he.decode(tokenInput.match(/value="(.*)"/)[1]);
  log("TGVmax token:", token);
  axiosInstance.defaults.headers.common.ValidityToken = token;

  const [{ data: origins }, { data: destinations }] = await Promise.all([
    axiosInstance(ORIGIN_URL),
    axiosInstance(DESTINATION_URL)
  ]);
  await Promise.all([setOrigins(origins), setDestinations(destinations)]);

  log(
    `Found ${origins.length} origins and ${destinations.length} destinations`
  );
}

export async function getAvailability(
  origin: string,
  destination: string,
  date: string
) {
  await checkToken();
  let beginDate = moment(date).startOf("day");
  const endDate = moment(date).endOf("day");
  const availability: string[] = [];
  let data;

  do {
    const url = `${AVAILABILITY_URL}/${origin}/${destination}/${beginDate.format(
      FORMAT
    )}/${endDate.format(FORMAT)}`;

    ({ data } = await axiosInstance(url));

    data.forEach((train: any) => {
      if (train.availableSeatsCount > 0) {
        availability.push(moment(train.departureDateTime).format("HH:mm"));
      }
    });

    if (data.length) {
      beginDate = moment(data[data.length - 1].departureDateTime).add(
        1,
        "minute"
      );
    }
  } while (data.length >= 6 && beginDate.isBefore(endDate));

  return availability;
}
