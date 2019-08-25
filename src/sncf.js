const axios = require("axios");
const he = require("he");
const moment = require("moment");

let axiosInstance = axios.create();
let token;
let tokenPromise;

const SIMULATOR_URL = "https://simulateur.tgvmax.fr/VSC/";
const API_URL = "https://sncf-simulateur-api-prod.azurewebsites.net/api";
const ORIGIN_URL = API_URL + "/Stations/AllOrigins";
const DESTINATION_URL = API_URL + "/Stations/AllDestinations";
const AVAILABILITY_URL = API_URL + "/RailAvailability/Search";
const FORMAT = "YYYY-MM-DDTHH:mm:ss";

async function checkToken() {
  if (tokenPromise) {
    return tokenPromise;
  }

  if (token == null) {
    console.log("Retrieving TGVmax token...");
    return (tokenPromise = getToken());
  }
}

async function getToken() {
  const { data } = await axios(SIMULATOR_URL);
  const inputs = data.match(/<input(?:.*)\/>/g);
  const tokenInput = inputs.find(input => input.includes("hiddenToken"));
  token = he.decode(tokenInput.match(/value="(.*)"/)[1]);
  console.log("TGVmax token:", token);
  axiosInstance.defaults.headers.common.ValidityToken = token;
}

async function getAllOrigins() {
  await checkToken();
  const { data } = await axiosInstance(ORIGIN_URL);
  return data;
}

async function getAllDestinations() {
  await checkToken();
  const { data } = await axiosInstance(DESTINATION_URL);
  return data;
}

async function getAvailability(origin, destination, date) {
  await checkToken();
  let beginDate = moment(date).startOf("day");
  const endDate = moment(date).endOf("day");
  const availability = [];
  let data;

  do {
    const url = `${AVAILABILITY_URL}/${origin}/${destination}/${beginDate.format(
      FORMAT
    )}/${endDate.format(FORMAT)}`;

    ({ data } = await axiosInstance(url));

    data.forEach(train => {
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

module.exports = { getAllOrigins, getAllDestinations, getAvailability };
