import multer from "multer";
import path from "path";
import fs from "fs";


// =========================================================
// UPLOAD DIRECTORY
// =========================================================

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "club-posts"
);


// =========================================================
// CREATE DIRECTORY IF NOT EXISTS
// =========================================================

if (!fs.existsSync(uploadDirectory)) {

  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );

}


// =========================================================
// STORAGE
// =========================================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadDirectory
      );

    },

    filename: (
      req,
      file,
      cb
    ) => {

      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        uniqueName
      );

    },

  });


// =========================================================
// FILE FILTER
// =========================================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );

  }

};


// =========================================================
// MULTER
// =========================================================

const clubPostUpload =
  multer({

    storage,

    fileFilter,

    limits: {

      // Maximum size per image: 5 MB

      fileSize:
        5 * 1024 * 1024,

      // Maximum number of images

      files: 10,

    },

  });


export default clubPostUpload;