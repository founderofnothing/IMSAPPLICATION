import ExamHall from "./examHall.model.js";

// =====================================================
// CREATE EXAM HALL
// =====================================================

export const createExamHall = async (institutionId, data) => {
  const {
    hallNumber,
    hallName,
    totalBenches,
    status,
  } = data;

  // Check duplicate hall number inside the same institution
  const existingHall = await ExamHall.findOne({
    institutionId,
    hallNumber: hallNumber.trim(),
  });

  if (existingHall) {
    throw new Error(
      "Exam hall with this hall number already exists in your institution."
    );
  }

  const examHall = await ExamHall.create({
    institutionId,
    hallNumber: hallNumber.trim(),
    hallName: hallName.trim(),
    totalBenches,
    status,
  });

  return examHall;
};

// =====================================================
// GET ALL EXAM HALLS
// =====================================================

// =====================================================
// GET ALL EXAM HALLS
// PAGINATION + STATUS FILTER + SEARCH
// =====================================================

export const getAllExamHalls = async (
  institutionId,
  filters = {}
) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
  } = filters;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const itemsPerPage = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (currentPage - 1) * itemsPerPage;

  // ===================================================
  // BASE QUERY
  // ===================================================

  const query = {
    institutionId,
  };

  // ===================================================
  // STATUS FILTER
  // ===================================================

  if (
    status &&
    status !== "all"
  ) {
    if (!["active", "inactive"].includes(status)) {
      throw new Error(
        "Invalid status filter. Use active, inactive, or all."
      );
    }

    query.status = status;
  }

  // ===================================================
  // SEARCH
  // ===================================================

  if (search && search.trim()) {
    const searchValue = search.trim();

    // Escape regex special characters
    const escapedSearch = searchValue.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    query.$or = [
      {
        hallNumber: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        hallName: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  // ===================================================
  // TOTAL COUNT
  // ===================================================

  const totalHalls = await ExamHall.countDocuments(query);

  // ===================================================
  // FETCH HALLS
  // ===================================================

  const examHalls = await ExamHall.find(query)
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(itemsPerPage);

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages = Math.ceil(
    totalHalls / itemsPerPage
  );

  return {
    examHalls,

    pagination: {
      currentPage,
      itemsPerPage,
      totalItems: totalHalls,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};

// =====================================================
// GET SINGLE EXAM HALL
// =====================================================

export const getExamHallById = async (
  institutionId,
  hallId
) => {
  const examHall = await ExamHall.findOne({
    _id: hallId,
    institutionId,
  }).populate(
    "institutionId",
    "institutionName institutionCode"
  );

  if (!examHall) {
    throw new Error("Exam hall not found.");
  }

  return examHall;
};

// =====================================================
// UPDATE EXAM HALL
// =====================================================

export const updateExamHall = async (
  institutionId,
  hallId,
  data
) => {
  const existingHall = await ExamHall.findOne({
    _id: hallId,
    institutionId,
  });

  if (!existingHall) {
    throw new Error("Exam hall not found.");
  }

  const {
    hallNumber,
    hallName,
    totalBenches,
    status,
  } = data;

  // ===================================================
  // CHECK DUPLICATE HALL NUMBER
  // ===================================================

  if (hallNumber !== undefined) {
    const duplicateHall = await ExamHall.findOne({
      _id: { $ne: hallId },
      institutionId,
      hallNumber: hallNumber.trim(),
    });

    if (duplicateHall) {
      throw new Error(
        "Exam hall with this hall number already exists in your institution."
      );
    }

    existingHall.hallNumber = hallNumber.trim();
  }

  // ===================================================
  // UPDATE FIELDS
  // ===================================================

  if (hallName !== undefined) {
    existingHall.hallName = hallName.trim();
  }

  if (totalBenches !== undefined) {
    existingHall.totalBenches = totalBenches;
  }

  if (status !== undefined) {
    existingHall.status = status;
  }

  await existingHall.save();

  return existingHall;
};

// =====================================================
// DELETE EXAM HALL
// =====================================================

export const deleteExamHall = async (
  institutionId,
  hallId
) => {
  const examHall = await ExamHall.findOne({
    _id: hallId,
    institutionId,
  });

  if (!examHall) {
    throw new Error("Exam hall not found.");
  }

  await ExamHall.findOneAndDelete({
    _id: hallId,
    institutionId,
  });

  return examHall;
};