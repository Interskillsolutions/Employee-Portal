import express from 'express';
import { getActiveBranches, getAllBranches, createBranch, toggleBranchStatus, deleteBranch } from '../controllers/branchController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Any authenticated user can view active branches (for clock-in)
router.get('/active', getActiveBranches);

// Admin only: full branch list, add branch, toggle status, delete
router.get('/all', getAllBranches);
router.post('/', createBranch);
router.put('/:id/toggle', toggleBranchStatus);
router.delete('/:id', deleteBranch);

export default router;
