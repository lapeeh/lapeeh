import { Router } from "express";
import { authRouter } from "@/modules/Auth/auth.routes";
import { rbacRouter } from "@/modules/Rbac/rbac.routes";
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rbac", rbacRouter);
