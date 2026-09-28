import Club from "../Clubcurd/Club.model.js";
import ClubPost from "./ClubPost.model.js";
import ClubPostComment from "../ClubPostComment/ClubPostComment.model.js";
import ClubPostLike from "../ClubPostLike/ClubPostLike.model.js";
import TeachingFaculty from "../../user/models/teachingFaculty.model.js";
import User from "../../user/models/user.model.js"
// ==========================================
// CREATE CLUB POST
// ==========================================




// ==========================================
// CREATE CLUB POST
// ==========================================

export const createClubPostService = async ({
  clubId,
  authorId,
  description,
  images = [],
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  console.log(
  "========== CREATE CLUB POST DEBUG =========="
);

console.log(
  "clubId:",
  clubId
);

console.log(
  "authorId:",
  authorId
);

console.log(
  "club.inchargeId:",
  club.inchargeId
);

console.log(
  "club.inchargeId string:",
  club.inchargeId.toString()
);

console.log(
  "authorId string:",
  authorId.toString()
);

console.log(
  "IS INCHARGE:",
  club.inchargeId.toString() ===
  authorId.toString()
);

console.log(
  "============================================="
);

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  // ==========================================
  // CHECK CLUB INCHARGE
  // ==========================================

  if (
    club.inchargeId.toString() !==
    authorId.toString()
  ) {

    throw new Error(
      "Only the club incharge can create posts."
    );

  }


  // ==========================================
  // CHECK AUTHOR USER
  // ==========================================

  const author = await User.findOne({
    _id: authorId,
    isDeleted: false,
  });

  if (!author) {

    throw new Error(
      "Club incharge user not found."
    );

  }


  // ==========================================
  // CREATE POST
  // ==========================================

const post =
  await ClubPost.create({

    clubId,

    authorId,

    description,

    images: images || [],

  });


  // ==========================================
  // POPULATE AUTHOR
  // ==========================================

  await post.populate(
    "authorId",
    "fullName email profileImage"
  );


  return post;
};


// ==========================================
// GET ALL CLUB POSTS
// PAGINATED
// ==========================================

export const getClubPostsService = async ({
  clubId,
  page = 1,
  limit = 10,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  const pageNumber = Math.max(
    1,
    Number(page)
  );

  const limitNumber = Math.min(
    50,
    Math.max(1, Number(limit))
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  // ==========================================
  // FETCH POSTS + TOTAL
  // ==========================================

  const [posts, totalPosts] =
    await Promise.all([
      ClubPost.find({
        clubId,
        isDeleted: false,
      })
        .populate(
          "authorId",
          "fullName email profileImage"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber),

      ClubPost.countDocuments({
        clubId,
        isDeleted: false,
      }),
    ]);

  // ==========================================
  // PAGINATION DATA
  // ==========================================

  const totalPages =
    Math.ceil(
      totalPosts / limitNumber
    );

  return {
    posts,

    pagination: {
      currentPage: pageNumber,
      limit: limitNumber,
      totalPosts,
      totalPages,

      hasNextPage:
        pageNumber < totalPages,

      hasPreviousPage:
        pageNumber > 1,
    },
  };
};


// ==========================================
// GET SINGLE CLUB POST
// ==========================================

export const getClubPostByIdService = async ({
  clubId,
  postId,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FIND ACTIVE POST
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: false,
  }).populate(
    "authorId",
    "fullName email profileImage"
  );

  if (!post) {
    throw new Error(
      "Club post not found."
    );
  }

  return post;
};


// ==========================================
// UPDATE CLUB POST
// ==========================================

// ==========================================
// UPDATE CLUB POST
// ==========================================

export const updateClubPostService = async ({
  clubId,
  postId,
  authorId,
  description,
  images,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  // ==========================================
  // CHECK CLUB INCHARGE
  // ==========================================

  if (
    club.inchargeId.toString() !==
    authorId.toString()
  ) {

    throw new Error(
      "Only the club incharge can update posts."
    );

  }


  // ==========================================
  // FIND ACTIVE POST
  // POST MUST BELONG TO THIS CLUB
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: false,
  });

  if (!post) {
    throw new Error(
      "Club post not found."
    );
  }


  // ==========================================
  // UPDATE DESCRIPTION
  // ==========================================

  if (description !== undefined) {

    if (!description.trim()) {

      throw new Error(
        "Post description cannot be empty."
      );

    }

    post.description =
      description.trim();

  }


  // ==========================================
  // UPDATE IMAGES
  // ==========================================

  if (images !== undefined) {

    if (!Array.isArray(images)) {

      throw new Error(
        "Images must be an array."
      );

    }

    post.images = images;

  }


  // ==========================================
  // SAVE POST
  // ==========================================

  await post.save();


  // ==========================================
  // POPULATE AUTHOR
  // ==========================================

  await post.populate(
    "authorId",
    "fullName email profileImage"
  );


  return post;
};


// ==========================================
// SOFT DELETE CLUB POST
// ==========================================

export const deleteClubPostService = async ({
  clubId,
  postId,
  authorId,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
    isDeleted: false,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }


  // ==========================================
  // CHECK CLUB INCHARGE
  // ==========================================

  if (
    club.inchargeId.toString() !==
    authorId.toString()
  ) {

    throw new Error(
      "Only the club incharge can delete posts."
    );

  }


  // ==========================================
  // FIND ACTIVE POST
  // POST MUST BELONG TO THIS CLUB
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: false,
  });

  if (!post) {
    throw new Error(
      "Club post not found."
    );
  }


  // ==========================================
  // SOFT DELETE
  // ==========================================

  post.isDeleted = true;

  post.deletedAt = new Date();


  // ==========================================
  // SAVE
  // ==========================================

  await post.save();


  // ==========================================
  // POPULATE AUTHOR
  // ==========================================

  await post.populate(
    "authorId",
    "fullName email profileImage"
  );


  return post;
};




// ==========================================
// GET DELETED POSTS OF A CLUB
// RECYCLE BIN
// ==========================================

export const getDeletedClubPostsService = async ({
  clubId,
}) => {

  // ==========================================
  // FIND CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FETCH DELETED POSTS
  // ==========================================

  const posts = await ClubPost.find({
    clubId,
    isDeleted: true,
  })
    .populate(
      "authorId",
      "fullName email profileImage"
    )
    .sort({
      deletedAt: -1,
    });

  return posts;
};


// ==========================================
// RESTORE CLUB POST
// ==========================================

export const restoreClubPostService = async ({
  clubId,
  postId,
  authorId,
}) => {

  // ==========================================
  // FIND ACTIVE CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FIND TEACHING FACULTY
  // ==========================================

  const teachingFaculty =
    await TeachingFaculty.findOne({
      userId: authorId,
      isDeleted: false,
    });

  if (!teachingFaculty) {
    throw new Error(
      "Logged-in user is not a teaching faculty."
    );
  }

  // ==========================================
  // CHECK CLUB INCHARGE
  // ==========================================

  if (
    club.inchargeId.toString() !==
    teachingFaculty.userId.toString()
  ) {
    throw new Error(
      "You are not the incharge of this club."
    );
  }

  // ==========================================
  // FIND DELETED POST
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: true,
  });

  if (!post) {
    throw new Error(
      "Deleted club post not found."
    );
  }

  // ==========================================
  // RESTORE
  // ==========================================

  post.isDeleted = false;
  post.deletedAt = null;

  await post.save();

  return post;
};


// ==========================================
// PERMANENTLY DELETE CLUB POST
// ==========================================
export const permanentlyDeleteClubPostService = async ({
  clubId,
  postId,
  authorId,
}) => {

  // ==========================================
  // FIND CLUB
  // ==========================================

  const club = await Club.findOne({
    _id: clubId,
  });

  if (!club) {
    throw new Error(
      "Club not found."
    );
  }

  // ==========================================
  // FIND TEACHING FACULTY
  // ==========================================

  const teachingFaculty =
    await TeachingFaculty.findOne({
      userId: authorId,
      isDeleted: false,
    });

  if (!teachingFaculty) {
    throw new Error(
      "Logged-in user is not a teaching faculty."
    );
  }

  // ==========================================
  // CHECK CLUB INCHARGE
  // ==========================================

  if (
    club.inchargeId.toString() !==
    teachingFaculty.userId.toString()
  ) {
    throw new Error(
      "You are not the incharge of this club."
    );
  }

  // ==========================================
  // FIND DELETED POST
  // ==========================================

  const post = await ClubPost.findOne({
    _id: postId,
    clubId,
    isDeleted: true,
  });

  if (!post) {
    throw new Error(
      "Deleted club post not found."
    );
  }

  // ==========================================
  // DELETE COMMENTS
  // ==========================================

  await ClubPostComment.deleteMany({
    postId,
  });

  // ==========================================
  // DELETE LIKES
  // ==========================================

  await ClubPostLike.deleteMany({
    postId,
  });

  // ==========================================
  // DELETE POST
  // ==========================================

  await ClubPost.deleteOne({
    _id: postId,
    clubId,
  });

  return post;
};