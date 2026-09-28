import * as idCardTemplateService
  from "../../services/idCardTemplateservice/idCardTemplateService.js";






// ============================================================
// CREATE
// ============================================================
export const createIDCardTemplate = async (
  req,
  res
) => {

  try {

    const template =
      await idCardTemplateService.createTemplate({

        name:
          req.body.name,

        description:
          req.body.description,

        design:
          req.body.design,

        thumbnail:
          req.body.thumbnail,

        userId:
          req.user.userId,
      });

    return res.status(201).json({
      success: true,
      message:
        "ID card template created successfully.",
      template,
    });

  } catch (error) {

    console.error(
      "Create ID card template error:",
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
// GET ALL
// ============================================================
export const getIDCardTemplates = async (
  req,
  res
) => {

  try {

    const result =
      await idCardTemplateService.getTemplates({

        status:
          req.query.status,

        search:
          req.query.search,

        page:
          req.query.page,

        limit:
          req.query.limit,
      });

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {

    console.error(
      "Get ID card templates error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};


// ============================================================
// GET BY ID
// ============================================================
export const getIDCardTemplateById = async (
  req,
  res
) => {

  try {

    const template =
      await idCardTemplateService.getTemplateById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      template,
    });

  } catch (error) {

    console.error(
      "Get ID card template error:",
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
// UPDATE
// ============================================================
export const updateIDCardTemplate = async (
  req,
  res
) => {

  try {

    const template =
      await idCardTemplateService.updateTemplate({

        templateId:
          req.params.id,

        name:
          req.body.name,

        description:
          req.body.description,

        design:
          req.body.design,

        thumbnail:
          req.body.thumbnail,

        userId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "ID card template updated successfully.",
      template,
    });

  } catch (error) {

    console.error(
      "Update ID card template error:",
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
// DELETE
// ============================================================
export const deleteIDCardTemplate = async (
  req,
  res
) => {

  try {

    await idCardTemplateService.deleteTemplate(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "ID card template deleted successfully.",
    });

  } catch (error) {

    console.error(
      "Delete ID card template error:",
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
// PUBLISH
// ============================================================
export const publishIDCardTemplate = async (
  req,
  res
) => {

  try {

    const template =
      await idCardTemplateService.publishTemplate({

        templateId:
          req.params.id,

        userId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "ID card template published successfully.",
      template,
    });

  } catch (error) {

    console.error(
      "Publish ID card template error:",
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
// UNPUBLISH
// ============================================================
export const unpublishIDCardTemplate = async (
  req,
  res
) => {

  try {

    const template =
      await idCardTemplateService.unpublishTemplate({

        templateId:
          req.params.id,

        userId:
          req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "ID card template unpublished successfully.",
      template,
    });

  } catch (error) {

    console.error(
      "Unpublish ID card template error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
};