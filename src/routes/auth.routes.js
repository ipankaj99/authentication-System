import {Router} from 'express';
import {registerUser, getUser, generateAccessToken, logoutUser, logoutAllUser, loginUser} from '../controllers/auth.controller.js'
const router=Router();

router.post('/register',registerUser);
router.get('/get-me',getUser);
router.get('/refresh-token',generateAccessToken);
router.get('/logout',logoutUser);
router.get('/logOutAll',logoutAllUser);

router.get('/login',loginUser);







export default router;
