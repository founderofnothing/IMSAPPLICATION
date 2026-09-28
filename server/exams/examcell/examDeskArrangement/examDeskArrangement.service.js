import ExamDeskArrangement from "./examDeskArrangement.model.js";
import ExamHall from "../examHall/examHall.model.js";

// =====================================================
// GENERATE COLUMN DEFINITIONS
// =====================================================

const generateColumnDefinitions = (totalColumns) => {
  const count = Number(totalColumns);

  if (!Number.isInteger(count) || count < 2) {
    throw new Error(
      "Total columns must be a number greater than or equal to 2."
    );
  }

  const columns = [];

  // ===================================================
  // 2 COLUMNS
  // LC1 | RC1
  // ===================================================

  if (count === 2) {
    return [
      {
        columnKey: "LC1",
        columnName: "Left Column 1",
        side: "left",
        order: 1,
      },
      {
        columnKey: "RC1",
        columnName: "Right Column 1",
        side: "right",
        order: 2,
      },
    ];
  }

  // ===================================================
  // ODD COLUMNS
  // LC1 | LC2 | M | RC2 | RC1
  // ===================================================

  if (count % 2 !== 0) {
    const sideColumns = Math.floor(count / 2);

    // LEFT
    for (let i = 1; i <= sideColumns; i++) {
      columns.push({
        columnKey: `LC${i}`,
        columnName: `Left Column ${i}`,
        side: "left",
        order: i,
      });
    }

    // MIDDLE
    columns.push({
      columnKey: "M",
      columnName: "Middle",
      side: "middle",
      order: sideColumns + 1,
    });

    // RIGHT
    for (let i = sideColumns; i >= 1; i--) {
      columns.push({
        columnKey: `RC${i}`,
        columnName: `Right Column ${i}`,
        side: "right",
        order: count - i + 1,
      });
    }

    return columns;
  }

  // ===================================================
  // EVEN COLUMNS
  // LC1 | LC2 | RC2 | RC1
  // ===================================================

  const sideColumns = count / 2;

  // LEFT
  for (let i = 1; i <= sideColumns; i++) {
    columns.push({
      columnKey: `LC${i}`,
      columnName: `Left Column ${i}`,
      side: "left",
      order: i,
    });
  }

  // RIGHT
  for (let i = sideColumns; i >= 1; i--) {
    columns.push({
      columnKey: `RC${i}`,
      columnName: `Right Column ${i}`,
      side: "right",
      order: count - i + 1,
    });
  }

  return columns;
};

// =====================================================
// VALIDATE COLUMN STRUCTURE
// =====================================================

const validateColumns = (
  columns = [],
  totalColumns,
  totalBenches
) => {
  if (!Array.isArray(columns)) {
    throw new Error("Columns must be an array.");
  }

  if (columns.length !== Number(totalColumns)) {
    throw new Error(
      `Column count mismatch. Expected ${totalColumns} columns, but ${columns.length} were provided.`
    );
  }

  const columnKeys = columns.map((column) =>
    String(column.columnKey || "").trim()
  );

  if (columnKeys.some((key) => !key)) {
    throw new Error(
      "Every column must have a column key."
    );
  }

  const duplicateKeys = columnKeys.filter(
    (key, index) =>
      columnKeys.indexOf(key) !== index
  );

  if (duplicateKeys.length > 0) {
    throw new Error(
      `Duplicate column found: ${duplicateKeys[0]}`
    );
  }

  for (const column of columns) {
    if (!Array.isArray(column.benches)) {
      throw new Error(
        `Benches must be an array for ${column.columnKey}.`
      );
    }

    if (column.benches.length !== Number(totalBenches)) {
      throw new Error(
        `${column.columnKey} must contain ${totalBenches} benches, but ${column.benches.length} were provided.`
      );
    }

    for (const bench of column.benches) {
      const capacity = Number(bench.capacity);

      if (![1, 2, 3].includes(capacity)) {
        throw new Error(
          `Invalid capacity for ${column.columnKey} Bench ${bench.benchNumber}. Capacity must be between 1 and 3.`
        );
      }
    }
  }
};

// =====================================================
// NORMALIZE COLUMNS
// =====================================================

const normalizeColumns = (
  columns,
  totalBenches
) => {
  return columns.map((column, columnIndex) => ({
    columnKey: String(
      column.columnKey
    ).trim(),

    columnName: String(
      column.columnName
    ).trim(),

    side: column.side,

    order: columnIndex + 1,

    benches: column.benches.map(
      (bench, benchIndex) => ({
        benchNumber:
          Number(bench.benchNumber) ||
          benchIndex + 1,

        capacity: Number(
          bench.capacity
        ),

        order: benchIndex + 1,
      })
    ),
  }));
};

// =====================================================
// CREATE DEFAULT COLUMNS
// =====================================================
//
// This helper is useful when the frontend sends only
// totalColumns and bench capacities.
//
// Example:
//
// totalColumns = 5
// totalBenches = 10
//
// The service creates:
//
// LC1
// LC2
// M
// RC2
// RC1
//
// Each column gets 10 benches.
//

const createDefaultColumns = (
  totalColumns,
  totalBenches,
  benchCapacities = []
) => {
  const definitions =
    generateColumnDefinitions(
      totalColumns
    );

  return definitions.map(
    (column) => ({
      ...column,

      benches: Array.from(
        { length: totalBenches },
        (_, index) => ({
          benchNumber: index + 1,

          capacity:
            Number(
              benchCapacities[index]
            ) || 1,

          order: index + 1,
        })
      ),
    })
  );
};

// =====================================================
// CREATE DESK ARRANGEMENT
// =====================================================

export const createDeskArrangement =
  async (
    institutionId,
    hallId,
    data
  ) => {
    const {
      totalColumns,
      columns,
      benchCapacities = [],
    } = data;

    // =================================================
    // CHECK HALL
    // =================================================

    const hall =
      await ExamHall.findOne({
        _id: hallId,
        institutionId,
      });

    if (!hall) {
      throw new Error(
        "Exam hall not found."
      );
    }

    // =================================================
    // CHECK EXISTING ARRANGEMENT
    // =================================================

    const existingArrangement =
      await ExamDeskArrangement.findOne({
        institutionId,
        hallId,
      });

    if (existingArrangement) {
      throw new Error(
        "Desk arrangement already exists for this exam hall."
      );
    }

    // =================================================
    // VALIDATE COLUMN COUNT
    // =================================================

    if (
      !Number.isInteger(
        Number(totalColumns)
      ) ||
      Number(totalColumns) < 2
    ) {
      throw new Error(
        "Total columns must be a number greater than or equal to 2."
      );
    }

    // =================================================
    // BUILD COLUMNS
    // =================================================

    let formattedColumns;

    if (
      Array.isArray(columns) &&
      columns.length > 0
    ) {
      validateColumns(
        columns,
        totalColumns,
        hall.totalBenches
      );

      formattedColumns =
        normalizeColumns(
          columns,
          hall.totalBenches
        );
    } else {
      formattedColumns =
        createDefaultColumns(
          totalColumns,
          hall.totalBenches,
          benchCapacities
        );
    }

    // =================================================
    // CREATE
    // =================================================

    const arrangement =
      await ExamDeskArrangement.create({
        institutionId,
        hallId,
        totalColumns:
          Number(totalColumns),
        columns:
          formattedColumns,
      });

    return arrangement;
  };

// =====================================================
// GET DESK ARRANGEMENT
// =====================================================

export const getDeskArrangement =
  async (
    institutionId,
    hallId
  ) => {
    // =================================================
    // CHECK HALL
    // =================================================

    const hall =
      await ExamHall.findOne({
        _id: hallId,
        institutionId,
      });

    if (!hall) {
      throw new Error(
        "Exam hall not found."
      );
    }

    // =================================================
    // FETCH ARRANGEMENT
    // =================================================

    const arrangement =
      await ExamDeskArrangement.findOne({
        institutionId,
        hallId,
      })
        .populate(
          "hallId",
          "hallNumber hallName totalBenches status"
        )
        .populate(
          "institutionId",
          "institutionName institutionCode"
        );

    if (!arrangement) {
      throw new Error(
        "Desk arrangement not found for this exam hall."
      );
    }

    return arrangement;
  };

// =====================================================
// UPDATE DESK ARRANGEMENT
// =====================================================

export const updateDeskArrangement =
  async (
    institutionId,
    hallId,
    data
  ) => {
    const {
      totalColumns,
      columns,
      benchCapacities = [],
    } = data;

    // =================================================
    // CHECK HALL
    // =================================================

    const hall =
      await ExamHall.findOne({
        _id: hallId,
        institutionId,
      });

    if (!hall) {
      throw new Error(
        "Exam hall not found."
      );
    }

    // =================================================
    // FIND ARRANGEMENT
    // =================================================

    const arrangement =
      await ExamDeskArrangement.findOne({
        institutionId,
        hallId,
      });

    if (!arrangement) {
      throw new Error(
        "Desk arrangement not found for this exam hall."
      );
    }

    // =================================================
    // USE EXISTING COLUMN COUNT
    // IF NOT PROVIDED
    // =================================================

    const finalTotalColumns =
      Number(totalColumns) ||
      arrangement.totalColumns;

    // =================================================
    // BUILD COLUMNS
    // =================================================

    let formattedColumns;

    if (
      Array.isArray(columns) &&
      columns.length > 0
    ) {
      validateColumns(
        columns,
        finalTotalColumns,
        hall.totalBenches
      );

      formattedColumns =
        normalizeColumns(
          columns,
          hall.totalBenches
        );
    } else {
      formattedColumns =
        createDefaultColumns(
          finalTotalColumns,
          hall.totalBenches,
          benchCapacities
        );
    }

    // =================================================
    // UPDATE
    // =================================================

    arrangement.totalColumns =
      finalTotalColumns;

    arrangement.columns =
      formattedColumns;

    await arrangement.save();

    return arrangement;
  };

// =====================================================
// DELETE DESK ARRANGEMENT
// =====================================================

export const deleteDeskArrangement =
  async (
    institutionId,
    hallId
  ) => {
    // =================================================
    // CHECK HALL
    // =================================================

    const hall =
      await ExamHall.findOne({
        _id: hallId,
        institutionId,
      });

    if (!hall) {
      throw new Error(
        "Exam hall not found."
      );
    }

    // =================================================
    // DELETE
    // =================================================

    const arrangement =
      await ExamDeskArrangement.findOneAndDelete(
        {
          institutionId,
          hallId,
        }
      );

    if (!arrangement) {
      throw new Error(
        "Desk arrangement not found for this exam hall."
      );
    }

    return arrangement;
  };