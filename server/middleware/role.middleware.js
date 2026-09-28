// middleware/role.middleware.js
import TeachingFaculty from "../user/models/teachingFaculty.model.js" 
import NonTeachingFaculty from "../user/models/nonTeachingFaculty.model.js";


export const authorize = (...roles) => {
    return (req, res, next) => {

       console.log("JWT User:", req.user);
    console.log("Allowed Roles:", roles);
    console.log("user designation ", roles);


  
      if (
        !roles.includes(req.user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    console.log("Method :", req.method);
  console.log("URL    :", req.url);
  console.log("Body   :", req.body);
      next();
    };
  };


  export const authorizeDesignation = (...designations) => {
  return async (req, res, next) => {
    const faculty = await TeachingFaculty.findOne({
      userId: req.user.userId,
    });

    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    if (!designations.includes(faculty.designation)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export const authorizeNonTeachingDesignation =
  (...designations) => {
    return async (
      req,
      res,
      next
    ) => {
      const staff =
        await NonTeachingFaculty.findOne({
          userId: req.user.userId,
        });

      if (!staff) {
        return res.status(403).json({
          success: false,
          message:
            "Staff profile not found",
        });
      }

      if (
        !designations.includes(
          staff.designation
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied",
        });
      }

      next();
    };
  };