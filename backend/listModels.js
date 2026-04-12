const API_KEY = "AIzaSyDajwDtZxVAyclJ7jZUTzCEp26OaSwM5ik";

async function listModels() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    const data = await res.json();

    console.log("MODELS:\n");

    if (data.models) {
      data.models.forEach((m) => {
        console.log(m.name);
      });
    } else {
      console.log(data);
    }

  } catch (err) {
    console.error("ERROR:", err);
  }
}

listModels();