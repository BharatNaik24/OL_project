import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import the Router components
import Login from "./components/login";
import Maps from "./components/maps";
import ProtectedRoute from "./protectedRoutes/protectedRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/maps"
          element={
            <ProtectedRoute>
              <Maps />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
