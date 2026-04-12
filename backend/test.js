const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDajwDtZxVAyclJ7jZUTzCEp26OaSwM5ik");

async function test() {
  try {
    const model = genAI.getGenerativeModel({
          model: "models/gemini-flash-latest"
    });

    const result = await model.generateContent("Say hello");
    console.log("OUTPUT:", result.response.text());
  } catch (err) {
    console.error("FULL ERROR:", err);
  }
}

test();