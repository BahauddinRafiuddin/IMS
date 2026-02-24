import express from "express";
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'

import {
  createCompany,
  getAllCompanies,
  toggleCompanyStatus
} from "../controllers/companyController.js";

const companyRouter = express.Router();

companyRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  createCompany
);

companyRouter.get(
  "/",
  authMiddleware,
  roleMiddleware("super_admin"),
  getAllCompanies
);

companyRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("super_admin"),
  toggleCompanyStatus
);

export default companyRouter;