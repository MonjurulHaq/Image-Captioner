import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import lostItemsRouter from "./lost-items";
import foundItemsRouter from "./found-items";
import claimsRouter from "./claims";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(lostItemsRouter);
router.use(foundItemsRouter);
router.use(claimsRouter);
router.use(notificationsRouter);
router.use(analyticsRouter);
router.use(aiRouter);

export default router;
