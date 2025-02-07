import { Router } from "express";
import informationHandler from "./modules/information/handler.js";
import membershipHandler from "./modules/membership/handler.js";
import transactionHandler from "./modules/transaction/handler.js";
import validator from "./middleware/schemaValidator.js";
import memberShipScema from "./modules/membership/schema.js";
import transactionSchema from "./modules/transaction/schema.js";
import validateToken from "./middleware/validateToken.js";
import uploadImage from "./middleware/upload.js";
import migrate from "./database/migration.js";
import seed from "./database/seeder.js";

const router = Router();

// migrate route
router.get('/migrate', (req, res) => {
    migrate();
    res.json({
        status: 0,
        message: "Migration success"
    });
});
router.get('/seed', (req, res) => {
    seed();
    res.json({
        status: 0,
        message: "Seeder success"
    });
})

// information routes
router.get('/banner', informationHandler.getBanners);
router.get('/services', validateToken, informationHandler.getServices);

// membership routes
router.post('/register', validator(memberShipScema.registerRequestSchema), membershipHandler.register);
router.post('/login', validator(memberShipScema.loginRequestSchema), membershipHandler.login);
router.get('/profile', validateToken, membershipHandler.getProfile);
router.put('/profile/update', validateToken, validator(memberShipScema.updateProfileRequestSchema), membershipHandler.updateProfile);
router.put(
    '/profile/image',
    validateToken,
    uploadImage.single('image'),
    membershipHandler.updateProfileImage
)

// transaction
router.get('/balance', validateToken, transactionHandler.getBalance);
router.post('/topup', validateToken, validator(transactionSchema.topupSchema), transactionHandler.topup);
router.post('/transaction', validateToken, validator(transactionSchema.createTransactionSchema), transactionHandler.createTransaction);
router.get('/transaction/history', validateToken, transactionHandler.getTransactionHistory);

export default router;