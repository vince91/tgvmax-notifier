const axios = require("axios");
const he = require("he");

let axiosInstance = axios.create();
let token; // = "BR5Ikd7ineJcw7VYFr4y3Q==";
let tokenPromise;

const SIMULATOR_URL = "https://simulateur.tgvmax.fr/VSC/";
const API_URL = "https://sncf-simulateur-api-prod.azurewebsites.net/api";
const ORIGIN_URL = API_URL + "/Stations/AllOrigins";
const DESTINATION_URL = API_URL + "/Stations/AllDestinations";

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

  // axiosInstance = axios.create({ headers: { ValidityToken: token } });
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

module.exports = { getAllOrigins, getAllDestinations };
