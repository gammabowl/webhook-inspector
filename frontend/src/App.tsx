import { Route, Routes, useParams } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import WebhookPage from "./pages/WebhookPage";
import { isWebhookId } from "./lib/webhookId";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:webhookId" element={<ValidatedWebhookPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ValidatedWebhookPage() {
  const { webhookId = "" } = useParams();

  if (!isWebhookId(webhookId)) {
    return <NotFound />;
  }

  return <WebhookPage />;
}
