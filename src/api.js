import { Router } from "express";
import informationHandler from "./modules/information/handler.js";
import membershipHandler from "./modules/membership/handler.js";
import validator from "./middleware/schemaValidator.js";
import memberShipScema from "./modules/membership/schema.js";
import validateToken from "./middleware/validateToken.js";
import uploadImage from "./middleware/upload.js";


const router = Router();

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

export default router;