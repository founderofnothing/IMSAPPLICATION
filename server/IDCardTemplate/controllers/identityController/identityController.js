import * as identityService
  from "../../services/identityService/identityService.js";


// ============================================================
// CREATE IDENTITY
// ============================================================
export const createIdentity = async (
  req,
  res
) => {

  try {

    const identity =
      await identityService.createIdentity({

        personType:
          req.body.personType,

        personId:
          req.body.personId,

        // IMPORTANT:
        // Institution comes from the
        // authenticated user's JWT.
        //
        // Do NOT trust institutionId
        // sent by the frontend.

        institutionId:
          req.user.institution,
      });


    return res.status(201).json({

      success: true,

      message:
        "Identity created successfully.",

      identity,
    });

  } catch (error) {

    console.error(
      "Create identity error:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message,
    });
  }
};


// ============================================================
// BULK CREATE IDENTITIES
// ============================================================
export const createBulkIdentities = async (
  req,
  res
) => {

  try {

    const result =
      await identityService.createBulkIdentities({

        personType:
          req.body.personType,

        personIds:
          req.body.personIds,

        institutionId:
          req.user.institution,

      });


    return res.status(201).json({

      success: true,

      message:
        "Bulk identities processed successfully.",

      ...result,

    });

  } catch (error) {

    console.error(
      "Bulk identity creation error:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });
  }
};


// ============================================================
// RESOLVE IDENTITY
// ============================================================
export const resolveIdentity = async (
  req,
  res
) => {

  try {

    const result =
      await identityService.resolveIdentity({

        identityToken:
          req.params.token,

        // Institution comes from JWT.
        // Never trust the frontend for this.

        institutionId:
          req.user.institution,
      });


    return res.status(200).json({

      success: true,

      message:
        "Identity resolved successfully.",

      ...result,
    });

  } catch (error) {

    console.error(
      "Resolve identity error:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message,
    });
  }
};