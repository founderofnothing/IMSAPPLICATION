import mongoose from "mongoose";
import IDCardTemplate from "../../models/IDCardTemplatefile/IDCardTemplate.model.js";







// ============================================================
// CREATE TEMPLATE
// ============================================================
export const createTemplate = async ({
  name,
  description,
  design,
  thumbnail,
  userId,
}) => {

  // ------------------------------------------
  // Validate template name
  // ------------------------------------------

  if (!name || !name.trim()) {
    throw new Error(
      "Template name is required."
    );
  }


  // ------------------------------------------
  // Validate user
  // ------------------------------------------

  if (!userId) {
    throw new Error(
      "Authenticated user is required."
    );
  }


  // ------------------------------------------
  // Create template
  // ------------------------------------------

  const template =
    await IDCardTemplate.create({

      name: name.trim(),

      description:
        description?.trim() || "",

      design:
        design || {},

      thumbnail:
        thumbnail || null,

      // New templates always start as draft
      status: "draft",

      // Your JWT provides userId
      createdBy: userId,

      updatedBy: userId,
    });


  // ------------------------------------------
  // Return created template
  // ------------------------------------------

  return template;
};



// ============================================================
// GET ALL TEMPLATES
// ============================================================

export const getTemplates = async ({
  status,
  search,
  page = 1,
  limit = 20,
}) => {

  const currentPage = Math.max(
    parseInt(page) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(parseInt(limit) || 20, 1),
    100
  );

  const skip =
    (currentPage - 1) * currentLimit;

  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  }

  // Search filter
  if (search?.trim()) {
    query.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const [
    templates,
    total,
  ] = await Promise.all([

    IDCardTemplate.find(query)
      .populate(
        "createdBy",
        "fullName email role"
      )
      .populate(
        "updatedBy",
        "fullName email role"
      )
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    IDCardTemplate.countDocuments(query),
  ]);

  return {
    templates,

    pagination: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(
        total / currentLimit
      ),
    },
  };
};


// ============================================================
// GET SINGLE TEMPLATE
// ============================================================

export const getTemplateById = async (
  templateId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  const template =
    await IDCardTemplate.findById(
      templateId
    )
      .populate(
        "createdBy",
        "fullName email role"
      )
      .populate(
        "updatedBy",
        "fullName email role"
      );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }

  return template;
};


// ============================================================
// UPDATE TEMPLATE
// ============================================================

export const updateTemplate = async ({
  templateId,
  name,
  description,
  design,
  thumbnail,
  userId,
}) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  if (!userId) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  const template =
    await IDCardTemplate.findById(
      templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }

  // Archived templates cannot be edited
  if (
    template.status === "archived"
  ) {
    throw new Error(
      "Archived templates cannot be edited."
    );
  }

  // Name validation
  if (
    name !== undefined &&
    !name.trim()
  ) {
    throw new Error(
      "Template name cannot be empty."
    );
  }

  if (name !== undefined) {
    template.name =
      name.trim();
  }

  if (description !== undefined) {
    template.description =
      description.trim();
  }

  // Design changed
  if (design !== undefined) {
    template.design =
      design;

    template.version += 1;
  }

  if (thumbnail !== undefined) {
    template.thumbnail =
      thumbnail;
  }

  template.updatedBy =
    userId;

  await template.save();

  return template;
};


// ============================================================
// DELETE TEMPLATE
// ============================================================

export const deleteTemplate = async (
  templateId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  const template =
    await IDCardTemplate.findById(
      templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }

  // Published templates cannot be deleted
  if (
    template.status === "published"
  ) {
    throw new Error(
      "Published templates cannot be deleted. Unpublish or archive them first."
    );
  }

  await IDCardTemplate.findByIdAndDelete(
    templateId
  );

  return true;
};


// ============================================================
// PUBLISH TEMPLATE
// ============================================================

export const publishTemplate = async ({
  templateId,
  userId,
}) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  if (!userId) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  const template =
    await IDCardTemplate.findById(
      templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }

  if (
    template.status === "published"
  ) {
    throw new Error(
      "Template is already published."
    );
  }

  template.status =
    "published";

  template.updatedBy =
    userId;

  await template.save();

  return template;
};


// ============================================================
// UNPUBLISH TEMPLATE
// ============================================================

export const unpublishTemplate = async ({
  templateId,
  userId,
}) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      templateId
    )
  ) {
    throw new Error(
      "Invalid template ID."
    );
  }

  if (!userId) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  const template =
    await IDCardTemplate.findById(
      templateId
    );

  if (!template) {
    throw new Error(
      "ID card template not found."
    );
  }

  if (
    template.status !== "published"
  ) {
    throw new Error(
      "Template is not currently published."
    );
  }

  template.status =
    "draft";

  template.updatedBy =
    userId;

  await template.save();

  return template;
};