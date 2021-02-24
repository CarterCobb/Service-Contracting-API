import { eRequestType } from "../Helpers/eRequestType.js";
import { rabbit } from "../app.js";

const messaging_routes = [
  {
    url: "/api/producer",
    type: eRequestType.GET,
    handler: async (req, res) => {
      try {
        const { message } = req.query;
        const sent = await rabbit.sendMessage(message);
        if (!sent) return res.status(500).json({ error: "Failed to send" });
        return res.status(200).json({ message: `Sent Message: ${message}` });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    },
  },
];

export default messaging_routes;
