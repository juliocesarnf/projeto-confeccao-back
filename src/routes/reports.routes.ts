import { Router } from "express";
import { ReportController } from "../modules/reports/report.controller.js";

const ReportRouter = Router();
const controller = new ReportController();

ReportRouter.get("/", controller.get.bind(controller));

export default ReportRouter;
