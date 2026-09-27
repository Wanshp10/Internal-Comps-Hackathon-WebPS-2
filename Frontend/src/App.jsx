import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import ExploreTasks from "./pages/ExploreTasks.jsx";
import Assistant from "./pages/Assistant.jsx";
import Sources from "./pages/Sources.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";
import NotFound from "./pages/NotFound.jsx";
import GraphPage from "./Graph/GraphPage.jsx";

function AppLayout() {
  const location = useLocation();
  const isRoadmap = location.pathname.startsWith("/roadmap");

  return (
    <div className={`app-shell ${isRoadmap ? "app-shell--roadmap" : ""}`}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<ExploreTasks />} />
        <Route path="/tasks/:taskId" element={<TaskDetails />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/roadmap" element={<GraphPage />} />
        <Route path="/roadmap/:taskId" element={<GraphPage />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isRoadmap && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
