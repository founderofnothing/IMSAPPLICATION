


import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath =
  "uploads/students";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(null, uploadPath);
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        );

      cb(
        null,
        uniqueName +
          path.extname(
            file.originalname
          )
      );
    },
  });

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedExtensions = [
    ".xlsx",
    ".xls",
  ];

  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/octet-stream",
  ];

  const ext =
    path.extname(
      file.originalname
    ).toLowerCase();

  const validExtension =
    allowedExtensions.includes(
      ext
    );

  const validMimeType =
    allowedMimeTypes.includes(
      file.mimetype
    );

  if (
    validExtension &&
    validMimeType
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only Excel (.xlsx, .xls) files are allowed."
    ),
    false
  );
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});


// ================================
// Academic Calendar Upload
// ================================

const calendarUploadPath =
  "uploads/academic-calendar";

if (
  !fs.existsSync(
    calendarUploadPath
  )
) {
  fs.mkdirSync(
    calendarUploadPath,
    {
      recursive: true,
    }
  );
}

const calendarStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        calendarUploadPath
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        );

      cb(
        null,
        uniqueName +
          path.extname(
            file.originalname
          )
      );
    },
  });

const calendarUpload =
  multer({
    storage:
      calendarStorage,

    fileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });





  // ================================
// Profile Image Upload
// ================================

const profileUploadPath =
  "uploads/profile";

if (
  !fs.existsSync(
    profileUploadPath
  )
) {
  fs.mkdirSync(
    profileUploadPath,
    {
      recursive: true,
    }
  );
}

const profileStorage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        profileUploadPath
      );

    },

    filename: (
      req,
      file,
      cb
    ) => {

      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        );

      cb(
        null,
        uniqueName +
          path.extname(
            file.originalname
          )
      );

    },

  });

const profileFileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ];

  const ext =
    path.extname(
      file.originalname
    );

  if (
    allowedTypes.includes(
      ext.toLowerCase()
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );

  }

};

const profileUpload =
  multer({

    storage:
      profileStorage,

    fileFilter:
      profileFileFilter,

    limits: {

      fileSize:
        2 * 1024 * 1024,

    },

  });


export default upload;

export {
  calendarUpload,
  profileUpload,
};