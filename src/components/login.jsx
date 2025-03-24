import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/maps");
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("https://reqres.in/api/login", {
        email: data.username,
        password: data.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        let customToken = localStorage.getItem("token");
        console.log(customToken);
        navigate("/maps");
      }
    } catch (error) {
      console.error("Error logging in", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] h-screen flex items-center justify-center px-6 md:px-8">
      <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-2/3 flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
        <div className="w-full lg:w-1/2 flex justify-center mb-8 lg:mb-0">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            interval={4000}
            className="shadow-lg rounded-lg overflow-hidden w-full"
          >
            <div>
              <img
                src="https://images.news18.com/ibnlive/uploads/2021/02/1612436324_pti02_04_2021_000111b-1.jpg"
                alt="Image 1"
                className="max-w-full h-auto"
              />
            </div>
            <div>
              <img
                src="https://c.ndtvimg.com/2019-04/gau1t0uo_rafale-fighter-aircraft_625x300_10_April_19.jpg?downsize=773:435"
                alt="Image 2"
                className="max-w-full h-auto"
              />
            </div>
            <div>
              <img
                src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202202/LCA-Jan25-1_1200x768.jpeg?size=690:388"
                alt="Image 3"
                className="max-w-full h-auto"
              />
            </div>
          </Carousel>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="bg-[#000] p-10 rounded-3xl shadow-xl w-full max-w-md">
            <h1 className="text-white text-4xl font-bold mb-6 text-center">
              Login
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="text-white text-lg font-medium"
                >
                  Username (email)
                </label>
                <input
                  id="username"
                  type="text"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 4,
                      message: "Username must be at least 4 characters",
                    },
                  })}
                  className="w-full p-4 mt-2 rounded-lg border-2 border-[#16a085] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#16a085] focus:border-transparent transition duration-300"
                  placeholder="Enter your email"
                />
                {errors.username && (
                  <span className="text-red-500 text-sm">
                    {errors.username.message}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-white text-lg font-medium"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="w-full p-4 mt-2 rounded-lg border-2 border-[#16a085] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#16a085] focus:border-transparent transition duration-300"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 mt-6 bg-[#16a085] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1abc9c] focus:outline-none focus:ring-2 focus:ring-[#16a085] focus:ring-opacity-50 transition duration-300"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="mt-4 text-center text-white text-sm">
              <a href="#forgot-password" className="hover:underline">
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
