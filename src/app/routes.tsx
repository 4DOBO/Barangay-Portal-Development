import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Homepage from "./components/Homepage";
import ReportsDashboard from "./components/ReportsDashboard";
import ManageAnnouncements from "./components/ManageAnnouncements";
import ManageProjects from "./components/ManageProjects";
import ManageAyuda from "./components/ManageAyuda";

import Login from "./components/Login";
import Signup from "./components/Signup";
import SubmitReport from "./components/SubmitReport";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Homepage },
      { path: "submit-report", Component: SubmitReport },
      { path: "admin/reports", Component: ReportsDashboard },
      { path: "admin/announcements", Component: ManageAnnouncements },
      { path: "admin/projects", Component: ManageProjects },
      { path: "admin/ayuda", Component: ManageAyuda },

    ],
  },
  // ↓ Outside Root — no header/footer
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
]);
