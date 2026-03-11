import dotenv from 'dotenv'
dotenv.config()
import axios from "axios";

export const analyzeComment = async (comment) => {
  try {

    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`;

    const response = await axios.post(url, {
      comment: { text: comment },
      languages: ["en"],
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
        IDENTITY_ATTACK: {}
      }
    });

    return response.data.attributeScores;

  } catch (error) {
    console.log("Perspective API error:", error.message);
    return null;
  }
};