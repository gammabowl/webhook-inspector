import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import WebhookPage from "./pages/WebhookPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:webhookId" element={<WebhookPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
