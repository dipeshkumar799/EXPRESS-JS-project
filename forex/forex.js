import axios from "axios";
const forexData = async () => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=30&from=2020-04-20&to=2023-05-20",
  };
  try {
    const response = await axios.request(config);
    console.log(response);
    return response.data.data.payload[0].rates;
  } catch (err) {
    throw new Error(err);
  }
};
export default forexData;
