import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainDashBord from "./Dashbord/MainDashBord";
import Login from "./Login";
import Overview from "./Dashbord/Overview";
import RootWallet from "./Dashbord/RootWallet";
import UserManagement from "./Dashbord/UserManagement";
import MLMAnalysisReport from "./Dashbord/Analytics";
import AdminSettingsDashboard from "./Dashbord/SystemSettings";
import MLMHierarchy from "./Dashbord/MLMHierarchy";
import ContactUs from "./Dashbord/ContactUs";
import NFTAdmin from "./Dashbord/NFTAdmin";
import ChangePassword from "./Dashbord/ChangePassword";
import NFTTreeAnalysis from "./Dashbord/NFTTreeAnalysis";
import ScrollToTop from "./Dashbord/ScrollToTop";
// import APITesting from "./Dashbord/APITesting";

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashbord" element={<MainDashBord />}>
          <Route index element={<Overview />} />
          <Route path="root-wallet" element={<RootWallet />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="system-settings" element={<AdminSettingsDashboard />} />
          <Route path="analytics" element={<MLMAnalysisReport />} />
          <Route path="mlm-hierarchy" element={<MLMHierarchy />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="nft-admin" element={<NFTAdmin />} />
          <Route path="nft-tree-analysis" element={<NFTTreeAnalysis />} />
          <Route path="change-password" element={<ChangePassword />} />
          {/* <Route path="api-testing" element={<APITesting />} /> */}

          <Route path="*" element={<Navigate to="/Dashbord" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
