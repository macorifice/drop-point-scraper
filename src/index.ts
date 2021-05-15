import axios, { AxiosResponse } from 'axios';
import rateLimit from 'axios-rate-limit';
import cap from './data/comuni.json';
import * as fs from 'fs';
import _ from 'lodash';

// This is the structure of the Point data we recieve
interface PointData {
  address: string;
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

const pointCenter: PointData[] = [];
// sets max 2 requests per 1 second, other will be delayed
// note maxRPS is a shorthand for perMilliseconds: 1000, and it takes precedence
// if specified both with maxRequests and perMilliseconds
const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 30000,
  maxRPS: 2,
});
http.getMaxRPS(); // 2

// options hot-reloading also available
http.setMaxRPS(3);
http.getMaxRPS(); // 3
http.setRateLimitOptions({ maxRequests: 6, perMilliseconds: 30000 }); // same options as constructor

Object.values(cap).map((r) => {
  http
    .post(`https://www.drop-point.store/api/find-droppoint-by-coords`, {
      query: r.cap[0],
    })
    .then((response: AxiosResponse) => {
      console.log('Risultati per : ', r.cap[0]);
      console.log(response.data.data);

      if (_.isEmpty(response.data.data)) {
        fs.appendFile('emptyCap.json', JSON.stringify(pointCenter), (err) => {
          // In case of a error throw err.
          if (err) throw err;
        });
      }

      pointCenter.push(_.omit(response.data.data[0], 'logo'));

      fs.appendFile('pointCenter.json', JSON.stringify(pointCenter), (err) => {
        // In case of a error append to errors file.
        if (err) {
          fs.appendFile('pointCenterError.json', JSON.stringify(pointCenter), (err) => {
            // In case of a error throw err.
            if (err) throw err;
          });
        };
      });
    })
    .catch((error) => console.log(error));
});
