import mongoose, { Schema, model, models } from "mongoose";

const ChatbotSchema = new Schema(
  {
    keywords: { 
      type: [String], 
      required: true 
    }, // Array of words like ["skill", "tech", "stack"]
    answer: { 
      type: String, 
      required: true 
    }, // The bot's response
  },
  { timestamps: true }
);

const Chatbot = models.Chatbot || model("Chatbot", ChatbotSchema);
export default Chatbot;
