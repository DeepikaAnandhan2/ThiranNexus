export const parseSpeech = (transcript, fieldType = 'text') => {
  let text = transcript.trim();

  // Handle special commands (case insensitive)
  const lowerText = text.toLowerCase();
  if (lowerText === "next" || lowerText === "next field") {
    return { command: "next", text: "" };
  }
  if (lowerText === "clear" || lowerText === "clear field") {
    return { command: "clear", text: "" };
  }
  if (lowerText === "submit" || lowerText === "submit form") {
    return { command: "submit", text: "" };
  }

  // Handle "capital X" -> "X"
  text = text.replace(/\b[Cc]apital ([a-zA-Z])\b/g, (match, p1) => p1.toUpperCase());

  // Symbol mappings (case insensitive)
  text = text.replace(/\b[Aa]t\b/g, "@");
  text = text.replace(/\b[Dd]ot\b/g, ".");
  text = text.replace(/\b[Uu]nderscore\b/g, "_");
  text = text.replace(/\b[Dd]ash\b/g, "-");
  text = text.replace(/\b[Hh]yphen\b/g, "-");
  text = text.replace(/\b[Ss]tar\b/g, "*");

  if (['email', 'password', 'username', 'udid'].includes(fieldType)) {
     // Remove all whitespace for these fields
     text = text.replace(/\s+/g, '');
     
     if (fieldType === 'email') {
         text = text.toLowerCase();
     }
  } else {
     // For Name, collapse single spaced letters into words
     let words = text.split(/\s+/);
     let processedWords = [];
     
     for (let i = 0; i < words.length; i++) {
       let word = words[i];
       if (word === "") continue;
       
       // If it's a single letter and next is also a single letter, combine them
       if (word.length === 1 && i < words.length - 1 && words[i+1].length === 1) {
         let combined = word;
         while (i + 1 < words.length && words[i+1].length === 1) {
           combined += words[i+1];
           i++;
         }
         processedWords.push(combined);
       } else {
         processedWords.push(word);
       }
     }
     text = processedWords.join(" ");
  }

  return { text, command: null };
};
