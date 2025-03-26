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
        navigate("/maps");
      }
    } catch (error) {
      console.error("Error logging in", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-gray-900 to-gray-700 px-6 md:px-12 py-12">
      <div className="w-full lg:w-1/2 flex justify-center mb-10 lg:mb-0">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          interval={4000}
          className="shadow-xl rounded-xl overflow-hidden w-full max-w-lg"
        >
          {["https://images.news18.com/ibnlive/uploads/2021/02/1612436324_pti02_04_2021_000111b-1.jpg",
            "https://c.ndtvimg.com/2019-04/gau1t0uo_rafale-fighter-aircraft_625x300_10_April_19.jpg?downsize=773:435",
            "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202202/LCA-Jan25-1_1200x768.jpeg?size=690:388"
          ].map((src, index) => (
            <div key={index}>
              <img src={src} alt={`Slide ${index + 1}`} className="w-full h-auto object-cover" />
            </div>
          ))}
        </Carousel>
      </div>

      <div className="w-full lg:w-1/2 flex justify-center">
        <div className="bg-black p-8 md:p-12 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="text-white text-lg font-medium">Username (email)</label>
              <input
                id="username"
                type="email"
                {...register("username", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" } })}
                className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                placeholder="Enter your email"
              />
              {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
            </div>
            <div>
              <label htmlFor="password" className="text-white text-lg font-medium">Password</label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                className="w-full p-4 mt-2 rounded-lg border-2 border-teal-500 bg-gray-800 text-white focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300"
                placeholder="Enter your password"
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-3 bg-teal-500 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-400 transition duration-300"
              >
                Login
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-white text-sm">
            <a href="#forgot-password" className="hover:underline">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
