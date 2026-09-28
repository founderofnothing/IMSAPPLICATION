import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import API from "../../../api/axios";

import "./ClubPage.css";


const ClubPage = () => {

  const { clubId } = useParams();


  // =========================================================
  // CLUB STATE
  // =========================================================

  const [club, setClub] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [postLoading, setPostLoading] =
    useState(false);


  // =========================================================
  // PAGINATION
  // =========================================================

  const [pagination, setPagination] = useState({

    currentPage: 1,

    limit: 10,

    totalPosts: 0,

    totalPages: 0,

    hasNextPage: false,

    hasPreviousPage: false,

  });


  // =========================================================
  // CREATE POST FORM
  // =========================================================

  const [postForm, setPostForm] = useState({

    description: "",

    images: [],

  });


  // =========================================================
  // IMAGE PREVIEWS
  // =========================================================

  const [imagePreviews, setImagePreviews] =
    useState([]);


  // =========================================================
  // EDIT STATE
  // =========================================================

const [editingPost, setEditingPost] =
  useState(null);

const [editImages, setEditImages] =
  useState([]);

const [editImagePreviews, setEditImagePreviews] =
  useState([]);


  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const clubToken =
    sessionStorage.getItem("clubToken");


  const clubUser =
    JSON.parse(
      sessionStorage.getItem("clubUser") || "null"
    );


  const storedClub =
    JSON.parse(
      sessionStorage.getItem("club") || "null"
    );


  // =========================================================
  // IMAGE BASE URL
  // =========================================================
  //
  // API baseURL is normally something like:
  //
  // http://localhost:3000/api
  //
  // Uploaded images are served from:
  //
  // http://localhost:3000/uploads/club-posts/...
  //
  // =========================================================

  const imageBaseURL =
    API.defaults?.baseURL
      ? API.defaults.baseURL.replace(
          /\/api\/?$/,
          ""
        )
      : "http://localhost:3000";


  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (image) => {

    if (!image) {
      return "";
    }


    // Already an absolute URL

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;

    }


    // Relative uploaded image

    if (image.startsWith("/")) {

      return `${imageBaseURL}${image}`;

    }


    return `${imageBaseURL}/${image}`;

  };


  // =========================================================
  // LOAD CLUB INFORMATION
  // =========================================================

  useEffect(() => {

    if (storedClub) {

      setClub(storedClub);

    }

  }, []);


  // =========================================================
  // FETCH CLUB POSTS
  // =========================================================

  const fetchPosts = async (
    page = 1
  ) => {

    if (!clubId) {

      toast.error(
        "Club information is missing."
      );

      return;

    }


    if (!clubToken) {

      toast.error(
        "Club authentication is missing."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await API.get(
          `/clubs/${clubId}/posts`,
          {

            params: {
              page,
              limit: 10,
            },

            headers: {
              Authorization:
                `Bearer ${clubToken}`,
            },

          }
        );


      const result =
        response.data.data;


      setPosts(
        result.posts || []
      );


      setPagination(
        result.pagination || {
          currentPage: page,
          limit: 10,
          totalPosts: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );


    } catch (error) {

      console.error(
        "Fetch club posts error:",
        error
      );


      console.log(
        "STATUS:",
        error.response?.status
      );


      console.log(
        "RESPONSE DATA:",
        error.response?.data
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch club posts."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // HANDLE IMAGE SELECTION
  // =========================================================

  const handleImageChange = (e) => {

    const selectedFiles =
      Array.from(
        e.target.files || []
      );


    if (!selectedFiles.length) {
      return;
    }


    // =======================================================
    // MAXIMUM 10 IMAGES
    // =======================================================

    const remainingSlots =
      10 - postForm.images.length;


    if (remainingSlots <= 0) {

      toast.error(
        "You can upload a maximum of 10 images."
      );

      e.target.value = "";

      return;

    }


    const filesToAdd =
      selectedFiles.slice(
        0,
        remainingSlots
      );


    // =======================================================
    // VALIDATE IMAGE TYPES
    // =======================================================

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];


    const invalidFile =
      filesToAdd.find(
        (file) =>
          !allowedTypes.includes(
            file.type
          )
      );


    if (invalidFile) {

      toast.error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      e.target.value = "";

      return;

    }


    // =======================================================
    // VALIDATE IMAGE SIZE
    // =======================================================
    //
    // Backend limit:
    // 5 MB per image
    //
    // =======================================================

    const oversizedFile =
      filesToAdd.find(
        (file) =>
          file.size >
          5 * 1024 * 1024
      );


    if (oversizedFile) {

      toast.error(
        "Each image must be smaller than 5 MB."
      );

      e.target.value = "";

      return;

    }


    // =======================================================
    // UPDATE FILE STATE
    // =======================================================

    setPostForm(
      (previous) => ({

        ...previous,

        images: [
          ...previous.images,
          ...filesToAdd,
        ],

      })
    );


    // =======================================================
    // CREATE PREVIEWS
    // =======================================================

    const newPreviews =
      filesToAdd.map(
        (file) => ({

          file,

          url:
            URL.createObjectURL(
              file
            ),

        })
      );


    setImagePreviews(
      (previous) => [
        ...previous,
        ...newPreviews,
      ]
    );


    // Reset input so the
    // same file can be selected again.

    e.target.value = "";

  };


  const handleEditImageChange = (e) => {

  const selectedFiles =
    Array.from(
      e.target.files || []
    );


  if (!selectedFiles.length) {
    return;
  }


  const existingCount =
    editingPost?.images?.length || 0;

  const newImageCount =
    editImages.length;

  const remainingSlots =
    10 -
    existingCount -
    newImageCount;


  if (remainingSlots <= 0) {

    toast.error(
      "You can upload a maximum of 10 images."
    );

    e.target.value = "";

    return;

  }


  const filesToAdd =
    selectedFiles.slice(
      0,
      remainingSlots
    );


  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];


  const invalidFile =
    filesToAdd.find(
      (file) =>
        !allowedTypes.includes(
          file.type
        )
    );


  if (invalidFile) {

    toast.error(
      "Only JPG, JPEG, PNG and WEBP images are allowed."
    );

    e.target.value = "";

    return;

  }


  const oversizedFile =
    filesToAdd.find(
      (file) =>
        file.size >
        5 * 1024 * 1024
    );


  if (oversizedFile) {

    toast.error(
      "Each image must be smaller than 5 MB."
    );

    e.target.value = "";

    return;

  }


  setEditImages(
    (previous) => [
      ...previous,
      ...filesToAdd,
    ]
  );


  const previews =
    filesToAdd.map(
      (file) => ({

        file,

        url:
          URL.createObjectURL(
            file
          ),

      })
    );


  setEditImagePreviews(
    (previous) => [
      ...previous,
      ...previews,
    ]
  );


  e.target.value = "";

};

const removeExistingEditImage = (
  index
) => {

  setEditingPost(
    (previous) => ({

      ...previous,

      images:
        previous.images.filter(
          (_, imageIndex) =>
            imageIndex !== index
        ),

    })
  );

};


const removeEditNewImage = (
  index
) => {

  const preview =
    editImagePreviews[index];


  if (preview?.url) {

    URL.revokeObjectURL(
      preview.url
    );

  }


  setEditImages(
    (previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
  );


  setEditImagePreviews(
    (previous) =>
      previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
  );

};

  // =========================================================
  // REMOVE SELECTED IMAGE
  // =========================================================

  const removeSelectedImage = (
    index
  ) => {

    const preview =
      imagePreviews[index];


    if (preview?.url) {

      URL.revokeObjectURL(
        preview.url
      );

    }


    setPostForm(
      (previous) => ({

        ...previous,

        images:
          previous.images.filter(
            (_, imageIndex) =>
              imageIndex !== index
          ),

      })
    );


    setImagePreviews(
      (previous) =>
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );

  };


  // =========================================================
  // CLEAR CREATE POST FORM
  // =========================================================

  const clearPostForm = () => {

    imagePreviews.forEach(
      (preview) => {

        if (preview.url) {

          URL.revokeObjectURL(
            preview.url
          );

        }

      }
    );


    setPostForm({

      description: "",

      images: [],

    });


    setImagePreviews([]);

  };


  // =========================================================
  // CREATE CLUB POST
  // =========================================================

  const createPost = async () => {

    if (
      !postForm.description.trim()
    ) {

      toast.error(
        "Post description is required."
      );

      return;

    }


    if (!clubId) {

      toast.error(
        "Club information is missing."
      );

      return;

    }


    if (!clubToken) {

      toast.error(
        "Club authentication is missing."
      );

      return;

    }


    try {

      setPostLoading(true);


      // =====================================================
      // FORM DATA
      // =====================================================

      const formData =
        new FormData();


      formData.append(
        "description",
        postForm.description.trim()
      );


      // =====================================================
      // APPEND MULTIPLE IMAGES
      // =====================================================

      postForm.images.forEach(
        (image) => {

          formData.append(
            "images",
            image
          );

        }
      );


      // =====================================================
      // CREATE REQUEST
      // =====================================================

      const response =
        await API.post(
          `/clubs/${clubId}/posts`,
          formData,
          {

            headers: {

              Authorization:
                `Bearer ${clubToken}`,

            },

          }
        );


      // =====================================================
      // RESPONSE
      // =====================================================

      const newPost =
        response.data.data;


      // =====================================================
      // ADD POST TO FEED
      // =====================================================

      setPosts(
        (previousPosts) => [

          newPost,

          ...previousPosts,

        ]
      );


      // =====================================================
      // CLEAR FORM
      // =====================================================

      clearPostForm();


      toast.success(
        "Post created successfully."
      );


    } catch (error) {

      console.error(
        "Create club post error:",
        error
      );


      console.log(
        "STATUS:",
        error.response?.status
      );


      console.log(
        "RESPONSE DATA:",
        error.response?.data
      );


      console.log(
        "MESSAGE:",
        error.response?.data?.message
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to create post."
      );

    } finally {

      setPostLoading(false);

    }

  };


  // =========================================================
  // UPDATE CLUB POST
  // =========================================================

const updatePost = async () => {

  if (!editingPost) {
    return;
  }


  if (
    !editingPost.description?.trim()
  ) {

    toast.error(
      "Post description is required."
    );

    return;

  }


  try {

    setPostLoading(true);


    // ==========================================
    // FORM DATA
    // ==========================================

    const formData =
      new FormData();


    // ==========================================
    // DESCRIPTION
    // ==========================================

    formData.append(
      "description",
      editingPost.description.trim()
    );


    // ==========================================
    // EXISTING IMAGES
    // ==========================================

    formData.append(
      "existingImages",
      JSON.stringify(
        editingPost.images || []
      )
    );


    // ==========================================
    // NEW IMAGES
    // ==========================================

    editImages.forEach(
      (image) => {

        formData.append(
          "images",
          image
        );

      }
    );


    // ==========================================
    // UPDATE API
    // ==========================================

    const response =
      await API.patch(
        `/clubs/${clubId}/posts/${editingPost._id}`,
        formData,
        {

          headers: {

            Authorization:
              `Bearer ${clubToken}`,

          },

        }
      );


    // ==========================================
    // UPDATED POST
    // ==========================================

    const updatedPost =
      response.data.data;


    // ==========================================
    // UPDATE FEED
    // ==========================================

    setPosts(
      (previousPosts) =>
        previousPosts.map(
          (post) =>
            post._id ===
            updatedPost._id
              ? updatedPost
              : post
        )
    );


    // ==========================================
    // CLEAR EDIT STATE
    // ==========================================

    editImagePreviews.forEach(
      (preview) => {

        if (preview.url) {

          URL.revokeObjectURL(
            preview.url
          );

        }

      }
    );


    setEditingPost(null);

    setEditImages([]);

    setEditImagePreviews([]);


    toast.success(
      "Post updated successfully."
    );


  } catch (error) {

    console.error(
      "Update club post error:",
      error
    );


    console.log(
      "STATUS:",
      error.response?.status
    );


    console.log(
      "RESPONSE:",
      error.response?.data
    );


    toast.error(
      error.response?.data?.message ||
      "Failed to update post."
    );

  } finally {

    setPostLoading(false);

  }

};


  // =========================================================
  // DELETE CLUB POST
  // =========================================================

  const deletePost = async (
    postId
  ) => {

    if (!postId) {

      return;

    }


    try {

      setPostLoading(true);


      await API.delete(
        `/clubs/${clubId}/posts/${postId}`,
        {

          headers: {

            Authorization:
              `Bearer ${clubToken}`,

          },

        }
      );


      setPosts(
        (previousPosts) =>
          previousPosts.filter(
            (post) =>
              post._id !== postId
          )
      );


      toast.success(
        "Post moved to recycle bin."
      );


    } catch (error) {

      console.error(
        "Delete club post error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to delete post."
      );

    } finally {

      setPostLoading(false);

    }

  };


  // =========================================================
  // GET SINGLE POST
  // =========================================================

  const getSinglePost = async (
    postId
  ) => {

    if (!postId) {

      return null;

    }


    try {

      const response =
        await API.get(
          `/clubs/${clubId}/posts/${postId}`,
          {

            headers: {

              Authorization:
                `Bearer ${clubToken}`,

            },

          }
        );


      return response.data.data;


    } catch (error) {

      console.error(
        "Get single club post error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch post."
      );


      return null;

    }

  };


  // =========================================================
  // PAGINATION
  // =========================================================

  const changePage = (
    page
  ) => {

    if (
      page < 1 ||
      page > pagination.totalPages
    ) {

      return;

    }


    fetchPosts(page);

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchPosts(1);


    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [clubId]);


  // =========================================================
  // CLEAN IMAGE PREVIEWS
  // =========================================================

  useEffect(() => {

    return () => {

      imagePreviews.forEach(
        (preview) => {

          if (preview.url) {

            URL.revokeObjectURL(
              preview.url
            );

          }

        }
      );

    };

  }, [imagePreviews]);


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="club_page">


      {/* =====================================================
          CLUB HEADER
      ===================================================== */}

      <section className="club_page_header">

        <div>

          <span className="club_page_eyebrow">
            CLUB
          </span>


          <h1>
            {club?.clubName || "Club"}
          </h1>


          <p>
            {club?.description ||
              "Club activities and updates."}
          </p>

        </div>


        <div className="club_page_meta">

          <strong>
            {club?.shortTag || ""}
          </strong>

        </div>

      </section>



      {/* =====================================================
          CREATE POST
      ===================================================== */}

      <section className="club_create_post">


        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <textarea
          value={
            postForm.description
          }
          onChange={(e) =>
            setPostForm(
              (previous) => ({

                ...previous,

                description:
                  e.target.value,

              })
            )
          }
          placeholder="Share something with your club..."
          disabled={postLoading}
        />



        {/* ===================================================
            IMAGE UPLOAD
        =================================================== */}

        <div className="club_post_upload_area">


          <label
            htmlFor="club-post-images"
            className="club_post_image_upload_button"
          >

            <span>
              Add Images
            </span>

            <small>
              JPG, PNG, WEBP · Max 5MB each
            </small>

          </label>


          <input
            id="club-post-images"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={
              handleImageChange
            }
            disabled={
              postLoading ||
              postForm.images.length >= 10
            }
            hidden
          />

        </div>



        {/* ===================================================
            IMAGE PREVIEWS
        =================================================== */}

        {imagePreviews.length > 0 && (

          <div className="club_post_image_previews">

            {imagePreviews.map(
              (preview, index) => (

                <div
                  className="club_post_image_preview"
                  key={`${preview.url}-${index}`}
                >

                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                  />


                  <button
                    type="button"
                    onClick={() =>
                      removeSelectedImage(
                        index
                      )
                    }
                    disabled={postLoading}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>

                </div>

              )
            )}

          </div>

        )}



        {/* ===================================================
            IMAGE COUNT
        =================================================== */}

        <div className="club_create_post_footer">

          <span className="club_image_count">

            {postForm.images.length}
            /10 images

          </span>


          <button
            type="button"
            onClick={createPost}
            disabled={postLoading}
          >

            {postLoading
              ? "Posting..."
              : "Create Post"}

          </button>

        </div>


      </section>



      {/* =====================================================
          POSTS
      ===================================================== */}

      <section className="club_posts">


        {loading ? (

          <div className="club_posts_loading">

            Loading posts...

          </div>


        ) : posts.length === 0 ? (

          <div className="club_posts_empty">

            <h3>
              No posts yet
            </h3>


            <p>
              This club hasn't shared
              any posts yet.
            </p>

          </div>


        ) : (

          posts.map(
            (post) => (

              <article
                className="club_post_card"
                key={post._id}
              >


                {/* =========================================
                    POST HEADER
                ========================================= */}

                <div className="club_post_header">

                  <div>

                    <strong>
                      {post.authorId?.fullName ||
                        "Club"}
                    </strong>


                    <span>
                      {post.authorId?.email ||
                        ""}
                    </span>

                  </div>

                </div>



                {/* =========================================
                    POST DESCRIPTION
                ========================================= */}

                <div className="club_post_description">

                  {post.description}

                </div>



                {/* =========================================
                    POST IMAGES
                ========================================= */}

                {post.images?.length > 0 && (

                  <div className="club_post_images">

                    {post.images.map(
                      (image, index) => (

                        <img
                          key={`${image}-${index}`}
                          src={
                            getImageUrl(
                              image
                            )
                          }
                          alt={`Club post ${index + 1}`}
                          loading="lazy"
                        />

                      )
                    )}

                  </div>

                )}



                {/* =========================================
                    POST ACTIONS
                ========================================= */}

                <div className="club_post_actions">


                  <button
                    type="button"
                  >
                    Like
                  </button>


                  <button
                    type="button"
                  >
                    Comment
                  </button>



                  {/* =======================================
                      OWNER ACTIONS
                  ======================================= */}

                  {clubUser?.userId ===
                    (
                      post.authorId?._id ||
                      post.authorId
                    ) && (

                    <>

                      <button
                        type="button"
onClick={() => {

  setEditingPost({

    ...post,

    description:
      post.description,

    images:
      post.images
        ? [...post.images]
        : [],

  });


  setEditImages([]);

  setEditImagePreviews([]);

}}
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          deletePost(
                            post._id
                          )
                        }
                        disabled={
                          postLoading
                        }
                      >
                        Delete
                      </button>

                    </>

                  )}

                </div>


              </article>

            )
          )

        )}

      </section>



      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {pagination.totalPages > 1 && (

        <div className="club_pagination">


          <button
            disabled={
              !pagination.hasPreviousPage
            }
            onClick={() =>
              changePage(
                pagination.currentPage - 1
              )
            }
          >
            Previous
          </button>


          <span>

            Page{" "}

            {pagination.currentPage}

            {" "}of{" "}

            {pagination.totalPages}

          </span>


          <button
            disabled={
              !pagination.hasNextPage
            }
            onClick={() =>
              changePage(
                pagination.currentPage + 1
              )
            }
          >
            Next
          </button>


        </div>

      )}



      {editingPost && (

  <div className="club_edit_overlay">

    <div className="club_edit_modal">


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="club_edit_header">

        <div>

          <span>
            CLUB POST
          </span>

          <h2>
            Edit Post
          </h2>

        </div>


        <button
          type="button"
          onClick={() => {

            setEditingPost(null);

            setEditImages([]);

            editImagePreviews.forEach(
              (preview) => {

                if (preview.url) {

                  URL.revokeObjectURL(
                    preview.url
                  );

                }

              }
            );

            setEditImagePreviews([]);

          }}
        >
          ×
        </button>

      </div>



      {/* ==========================================
          BODY
      ========================================== */}

      <div className="club_edit_body">


        <label>
          Description
        </label>


        <textarea
          value={
            editingPost.description
          }
          onChange={(e) =>
            setEditingPost(
              (previous) => ({

                ...previous,

                description:
                  e.target.value,

              })
            )
          }
        />



        {/* ========================================
            EXISTING IMAGES
        ======================================== */}

        {editingPost.images?.length > 0 && (

          <div className="club_edit_section">

            <h3>
              Current Images
            </h3>


            <div className="club_edit_image_grid">

              {editingPost.images.map(
                (image, index) => (

                  <div
                    className="club_edit_image"
                    key={`${image}-${index}`}
                  >

                    <img
                      src={
                        getImageUrl(
                          image
                        )
                      }
                      alt="Current post"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        removeExistingEditImage(
                          index
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        )}



        {/* ========================================
            ADD NEW IMAGES
        ======================================== */}

        <div className="club_edit_section">

          <h3>
            Add Images
          </h3>


          <label
            htmlFor="club-edit-images"
            className="club_edit_upload"
          >

            <span>
              + Add Images
            </span>

            <small>
              JPG, PNG, WEBP · Max 5MB each
            </small>

          </label>


          <input
            id="club-edit-images"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            hidden
            onChange={
              handleEditImageChange
            }
          />

        </div>



        {/* ========================================
            NEW IMAGE PREVIEWS
        ======================================== */}

        {editImagePreviews.length > 0 && (

          <div className="club_edit_image_grid">

            {editImagePreviews.map(
              (preview, index) => (

                <div
                  className="club_edit_image"
                  key={`${preview.url}-${index}`}
                >

                  <img
                    src={preview.url}
                    alt="New upload"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      removeEditNewImage(
                        index
                      )
                    }
                  >
                    ×
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>



      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="club_edit_footer">

        <button
          type="button"
          className="club_edit_cancel"
          onClick={() => {

            setEditingPost(null);

            setEditImages([]);

            editImagePreviews.forEach(
              (preview) => {

                if (preview.url) {

                  URL.revokeObjectURL(
                    preview.url
                  );

                }

              }
            );

            setEditImagePreviews([]);

          }}
        >
          Cancel
        </button>


        <button
          type="button"
          className="club_edit_save"
          onClick={updatePost}
          disabled={postLoading}
        >

          {postLoading
            ? "Updating..."
            : "Update Post"}

        </button>

      </div>


    </div>

  </div>

)}

    </div>

  );

};


export default ClubPage;