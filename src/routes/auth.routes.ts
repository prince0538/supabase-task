import { Router } from 'express';
import { addUser, getUsers, login, getUserById, updateUser, deleteUser } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router()

router.post('/create', addUser);
router.post('/login', login);
router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.get('/:id', authenticate, authorize('ADMIN'), getUserById);
router.put('/:id', authenticate, authorize('USER', 'ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser)

export default router