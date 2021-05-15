import axios, { AxiosResponse } from 'axios';
import rateLimit from 'axios-rate-limit';
import cap from './data/cap.json';
import * as fs from 'fs';
import _ from 'lodash';

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

const http = rateLimit(axios.create(), {
  maxRequests: 2,
  perMilliseconds: 10000,
  maxRPS: 2,
});
http.getMaxRPS();

http.setMaxRPS(3);
http.getMaxRPS();
http.setRateLimitOptions({ maxRequests: 10, perMilliseconds: 30000 });

Object.values(cap).map((r) => {
  http
    .post(`https://www.drop-point.store/api/find-droppoint-by-coords`, {
      query: r.cap[0],
    })
    .then((response: AxiosResponse) => {

      console.log(`Risultati per CAP ${r.cap[0]}`, response.data.data[0] ? response.data.data[0] : '[]');

      fs.appendFile(
        'src/result/points.log',
        `Risultati per CAP ${r.cap[0]} : 
        ${JSON.stringify(response.data.data[0] ? response.data.data[0] : '[]')}
        `,
        (err) => {
          if (err) throw err;
        }
      );

      if (_.isEmpty(response.data.data)) {
        fs.appendFile(
          'src/result/emptyCap.json',
          `${JSON.stringify(r.cap[0])},`,
          (err) => {
            if (err) throw err;
          }
        );
      }

      pointCenter.push(_.omit(response.data.data[0], 'logo'));

      fs.appendFile(
        'src/result/pointCenter.json',
        JSON.stringify(pointCenter),
        (err) => {
          if (err) throw err;
        }
      );
    })
    .catch((error) => {
      fs.appendFile(
        'src/result/pointCenterError.json',
        JSON.stringify(`${r.cap[0]}: ${error}`),
        (err) => {
          if (err) throw err;
        }
      );
    });
});
