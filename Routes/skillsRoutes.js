import { Router } from "express";
import { upload } from "../Middleware/mullter.js";
import { allSkills, postSkill, skillSearch } from "../src/Controllers/skills.controller.js";
import { verifyJwt } from "../Middleware/auth.middleware.js";

const router = Router();

router.route("/createskills").post(
    upload.fields([
      { name: 'skillImage', maxCount: 1 },
      { name: 'skillVideo', maxCount: 1 },
      { name: 'certifications', maxCount: 1 }
    ]),
    verifyJwt,
    postSkill
  );

  router.route("/allskills").get(verifyJwt,allSkills);
router.route("/search").get(verifyJwt,skillSearch)
export default router;