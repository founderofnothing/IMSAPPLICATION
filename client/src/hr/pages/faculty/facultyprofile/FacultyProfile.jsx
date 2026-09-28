import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import API, {
  SERVER_URL,
} from "../../../../api/axios";


const FacultyProfile = () => {

    const { id } =
  useParams();

const navigate =
  useNavigate();

const [user, setUser] =
  useState(null);

const [loading, setLoading] =
  useState(true);



  /* ===============================
    FETCH USER
=============================== */

const fetchUser = async () => {

  try {

    setLoading(true);

    const response =
      await API.get(
        `/users/${id}`
      );

    setUser(
      response.data.data
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to fetch user."

    );

  } finally {

    setLoading(false);

  }

};

useEffect(() => {

  fetchUser();

}, []);

if (loading) {

  return (

    <h2>

      Loading...

    </h2>

  );

}

return (

<div>

<pre>

{

JSON.stringify(

user,

null,

2

)

}

</pre>

</div>

);
}

export default FacultyProfile