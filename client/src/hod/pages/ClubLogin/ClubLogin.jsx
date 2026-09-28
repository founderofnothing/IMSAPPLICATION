import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SignIn } from "@phosphor-icons/react";

import API from "../../../api/axios";

import "./ClubLogin.css";


const ClubLogin = () => {

  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  const [loading, setLoading] =
    useState(false);


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  // =========================================================
  // CLUB LOGIN
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // =======================================================
    // BASIC VALIDATION
    // =======================================================

    if (!formData.email.trim()) {

      toast.error(
        "Email is required."
      );

      return;

    }


    if (!formData.password) {

      toast.error(
        "Password is required."
      );

      return;

    }


    try {

      setLoading(true);


      // =====================================================
      // CLUB LOGIN API
      // =====================================================
      //
      // Club ID is NOT sent.
      //
      // Backend will:
      //
      // email
      //   ↓
      // User
      //   ↓
      // User._id
      //   ↓
      // Club.inchargeId
      //   ↓
      // Club
      //
      // =====================================================

      const response =
        await API.post(
          "/clubs/login",
          {
            email:
              formData.email.trim(),

            password:
              formData.password,
          }
        );


      // =====================================================
      // RESPONSE DATA
      // =====================================================

      const {
        token,
        user,
        club,
      } =
        response.data.data;


      // =====================================================
      // SAFETY CHECK
      // =====================================================

      if (!token || !user || !club) {

        toast.error(
          "Invalid club login response."
        );

        return;

      }


      // =====================================================
      // STORE CLUB AUTHENTICATION
      // =====================================================

      sessionStorage.setItem(
        "clubToken",
        token
      );

      sessionStorage.setItem(
        "clubUser",
        JSON.stringify(user)
      );

      sessionStorage.setItem(
        "club",
        JSON.stringify(club)
      );


      // =====================================================
      // OPTIONAL INDIVIDUAL VALUES
      // =====================================================

      sessionStorage.setItem(
        "clubId",
        club._id
      );

      sessionStorage.setItem(
        "clubName",
        club.clubName
      );

      sessionStorage.setItem(
        "clubShortTag",
        club.shortTag
      );


      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "=== CLUB LOGIN SUCCESS ==="
      );

      console.log(
        "CLUB TOKEN:",
        token
      );

      console.log(
        "CLUB USER:",
        user
      );

      console.log(
        "CLUB:",
        club
      );

      console.log(
        "CLUB ID:",
        club._id
      );


      // =====================================================
      // SUCCESS TOAST
      // =====================================================

      toast.success(
        "Club login successful."
      );


      // =====================================================
      // NAVIGATE TO CLUB PAGE
      // =====================================================

      navigate(
        `/club/${club._id}`
      );


    } catch (error) {

      console.error(
        "Club Login Error:",
        error
      );


      // =====================================================
      // ERROR MESSAGE
      // =====================================================

      toast.error(
        error.response?.data?.message ||
        "Club login failed."
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="club_login_page">


      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <div className="club_login_card">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="club_login_header">

          <span className="club_login_eyebrow">
            CLUB PORTAL
          </span>

          <h1>
            Club Login
          </h1>

          <p>
            Sign in using your club
            incharge account.
          </p>

        </div>


        {/* ===================================================
            LOGIN FORM
        =================================================== */}

        <form
          className="club_login_form"
          onSubmit={handleSubmit}
        >


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="club_login_field">

            <label
              htmlFor="club-login-email"
            >
              Email
            </label>

            <input
              id="club-login-email"
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="club_login_field">

            <label
              htmlFor="club-login-password"
            >
              Password
            </label>

            <input
              id="club-login-password"
              type="password"
              name="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

          </div>


          {/* =================================================
              SUBMIT BUTTON
          ================================================= */}

          <button
            type="submit"
            className="club_login_submit"
            disabled={loading}
          >

            <span>

              {loading
                ? "Logging in..."
                : "Login to Club"}

            </span>


            {!loading && (
              <SignIn />
            )}

          </button>


        </form>


      </div>


    </div>

  );

};


export default ClubLogin;