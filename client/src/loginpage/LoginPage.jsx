import { useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { SignIn  } from "@phosphor-icons/react";
import "./loginpage.css"
import logo from "../assets/browserleaf_logo.svg"
const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await API.post(
      "/auth/login",
      formData
    );

    const { token, user } = response.data.data;

    // Store authentication for this tab
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("fullName", user.fullName);
    sessionStorage.setItem("designation", user.designation);
    sessionStorage.setItem("institution", user.institution);


    console.log("=== SESSION STORAGE CHECK ===");
    console.log("TOKEN:", sessionStorage.getItem("token"));
    console.log("USER:", sessionStorage.getItem("user"));
    console.log("FULL NAME:", sessionStorage.getItem("fullName"));
    console.log("DESIGNATION:", sessionStorage.getItem("designation"));

    console.log(
  "INSTITUTION:",
  sessionStorage.getItem("institution")
);

    toast.success("Login successful");

    const designation = user.designation?.toLowerCase();

    switch (designation) {
      case "hr":
        navigate("/hr");
        break;

      case "admission_officer":
        navigate("/admission-cell");
        break;

      case "principal":
        navigate("/principal");
        break;

      case "hod":
        navigate("/hod");
        break;

      case "professor":
        navigate("/professor");
        break;

      case "accountant":
        navigate("/accountant");
        break;

      case "cashier":
        navigate("/cashier");
        break;

              case "examcell":
        navigate("/examcell");
        break;

      case "admin":
        navigate("/admin");
        break;

              case "librarian":
        navigate("/library");
        break;

        // office_assistant

          case "office_assistant":
        navigate("/office_assistant");
        break;

      default:
        console.error(
          "Unknown designation:",
          user.designation
        );

        toast.error("No dashboard assigned for this user.");
        navigate("/");
        break;
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    toast.error(
      error.response?.data?.message ||
      "Login failed"
    );

  } finally {
    setLoading(false);
  }
};
  console.log("Submit clicked");

  return (
    <div className="login_container">

            <div className="lhs_login_page_layout">

              <div className="lg_page_info_wrapper">
<div className="sft_info_wrapper">
 <img className="bflogo_lgpage" src={logo} alt="Logo" />
  <h3 className="sft_title_lgpage">ims</h3>
</div>
 
         <p className="shorthandle_of_lgpage">Powered by BrowserLeaf</p>

              </div>
       

      </div>



<div className="log_form_wrapper">
  

  
<div className="sft_info_wrapper_sec">
 <img className="bflogo_lgpage_Sec" src={logo} alt="Logo" />
  <h3 className="sft_title_lgpage_sec">ims</h3>
</div>


      <h2 className="lg_user_title">
      faculty login

</h2>
      <form
        className="login_form"
        onSubmit={handleSubmit}
      >

        <div className="formdfield_one">
          <label className="lg_page_field_title">Email</label>
          <input
          className="lg_page_input_field"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required

            
          />
        </div>

        <div  className="formdfield_two">
          <label className="lg_page_field_title">Password</label>
          <input
          className="lg_page_input_field"

            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        <button
        className="lg_submit_btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}

          <SignIn className="lg_page_icon"/>
        </button>
      </form>



</div>

    </div>
  );
};

export default LoginPage;