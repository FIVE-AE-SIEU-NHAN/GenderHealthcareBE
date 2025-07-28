import express from "express";
import { getDashboardStatistic } from "~/controllers/Statistics.controllers";

const dashboardRouter = express.Router();

dashboardRouter.get("/statistic", getDashboardStatistic);

export default dashboardRouter;