import axios from "axios";
import { Router, json } from "express";
import cors from "cors";
import { getConfigFile } from "medusa-core-utils";

export default (rootDirectory) => {
  const router = Router();
  const { configModule } = getConfigFile(rootDirectory, "medusa-config");
  const { projectConfig } = configModule;

  const corsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };

  router.use(cors(corsOptions));

  // Create a new payment session
  router.post("/session", json(), async (req, res) => {
    const klarnaSessionEndpoint =
      "https://api-na.playground.klarna.com/payments/v1/sessions";

    try {
      const orderInfo = req.body;

      const createSession = await axios({
        method: "post",
        url: klarnaSessionEndpoint,
        data: orderInfo,
        auth: {
          username: process.env.KLARNA_USERNAME,
          password: process.env.KLARNA_PASSWORD,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      res.json(createSession.data);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  // Create a new order
  router.post("/place-order", json(), async (req, res) => {
    try {
      const authorization_token = req.body.authorization_token;
      const klarnaPlaceOrderEndpoint = `https://api-na.playground.klarna.com/payments/v1/authorizations/${authorization_token}/order`;
      const orderInfo = req.body.orderInfo;


      console.log(orderInfo)

      const placeOrder = await axios({
        method: "post",
        url: klarnaPlaceOrderEndpoint,
        data: orderInfo,
        auth: {
          username: process.env.KLARNA_USERNAME,
          password: process.env.KLARNA_PASSWORD,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      res.json(placeOrder.data);
    } catch (error) {
        console.log(error)
      res.status(400).json(error);
    }
  });

  return router;
};
