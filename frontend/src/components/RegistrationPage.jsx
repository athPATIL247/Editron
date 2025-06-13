import { useState } from "react";
import "../styling/RegistrationPage.css";
import { loginUser, signupUser } from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const RegistrationPage = () => {
    const [signup, setSignup] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    });
    const navigate = useNavigate();

    const handleSignupFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.username || !formData.password) {
            toast.error("Fill all the details");
            return;
        }
        try {
            const res = await signupUser(formData);
            if (res.data.status === 'success') {
                return toast.success("User created successfully");
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    const handleLoginFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            return toast.error("Fill all the details");
        }
        try {
            const res = await loginUser({
                email: formData.email,
                password: formData.password
            });
            console.log("res: ", res);
            if (res.data.status === 'success') {
                navigate('/home');
                return toast.success("Logged In Successfully");
            }
            else {
                return toast.error("Invalid Credentials");
            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    return (
        <section className="login-page">
            <div className="login-container">
                <div className="left">
                    <div className="left-content">
                        <p className="company-name">@ Editron</p>
                        <h1>Getting Started with Us</h1>
                        <p>Complete these easy steps to register your account</p>
                        <div className="rectangle" style={{ backgroundColor: "whitesmoke", color: "black" }}> Sign up your account</div>
                        <div className="rectangle"> Set up your workplace</div>
                        <div className="rectangle"> Set up your profile</div>
                    </div>
                </div>

                <div className="right">
                    <div className="right-content">
                        <h1>{signup ? "Sign Up" : "Log In"} Account</h1>
                        <p>Enter your personal data to {signup ? "sign up" : "log in"} your account.</p>

                        {signup && <form className="registration-form" onSubmit={handleSignupFormSubmit}>
                            <div className="form-data">
                                <label htmlFor="name">Username</label>
                                <input type="text" placeholder="eg. coder123" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="form-data">
                                <label htmlFor="email">Email</label>
                                <input type="text" placeholder="eg. coder123@gmail.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-data">
                                <label htmlFor="password">Password</label>
                                <input type="password" placeholder="Enter your password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>

                            <button type="submit">Sign Up</button>
                            <p>Already have an account?  <span onClick={() => setSignup(!signup)}>Log in</span></p>
                        </form>
                        }

                        {!signup && <form className="registration-form" onSubmit={handleLoginFormSubmit}>
                            <div className="form-data">
                                <label htmlFor="email">Email</label>
                                <input type="text" placeholder="eg. coder123@gmail.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-data">
                                <label htmlFor="password">Password</label>
                                <input type="password" placeholder="Enter your password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>

                            <button type="submit">Log In</button>
                            <p>Dont have an account? <span onClick={() => setSignup(!signup)}>Create Account</span></p>
                        </form>
                        }

                    </div>
                </div>
            </div>
        </section>
    );
}