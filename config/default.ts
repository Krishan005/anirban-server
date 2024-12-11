import dotenv from 'dotenv';

dotenv.config();

export default {
  port: Number(process.env.PORT) ,
  host: process.env.HOST,
  dbUri: process.env.DB_URI,
//   saltWorkFactor: 10,
//   accessTokenTtl: 3600,
//   refreshTokenTtl: 60,
//   privateKey: `${process.env.ACCESS_PRIVATE_KEY}`,
//   publicKey: `${process.env.ACCESS_PUBLIC_KEY}`,
};
