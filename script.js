const textInput = document.getElementById("textInput");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

const wordCountEl = document.getElementById("wordCount");
const charCountEl = document.getElementById("charCount");
const charNoSpacesCountEl = document.getElementById("charNoSpacesCount");
const sentenceCountEl = document.getElementById("sentenceCount");
const paragraphCountEl = document.getElementById("paragraphCount");
const readingTimeEl = document.getElementById("readingTime");
const speakingTimeEl = document.getElementById("speakingTime");
const avgSentenceLengthEl = document.getElementById("avgSentenceLength");

const longSentenceWarningEl = document.getElementById("longSentenceWarning");
const topWordsListEl = document.getElementById("topWordsList");
const sentenceLengthNoteEl = document.getElementById("sentenceLengthNote");

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
  "has", "have", "he", "her", "his", "i", "if", "in", "is", "it", "its",
  "me", "my", "of", "on", "or", "our", "she", "so", "that", "the", "their",
  "them", "there", "they", "this", "to", "was", "we", "were", "will", "with",
  "you", "your"
]);

function getWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter(Boolean);
}

function getSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function getParagraphs(text) {
  return text
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean);
}

function formatMinutes(value) {
  if (!isFinite(value) || value <= 0) return "0 min";
  if (value < 1) return "< 1 min";
  return `${value.toFixed(1)} min`;
}

function cleanWord(rawWord) {
  return rawWord.toLowerCase().replace(/[^a-z0-9']/gi, "");
}

function getTopWords(words, limit = 6) {
  const counts = {};

  for (const rawWord of words) {
    const word = cleanWord(rawWord);
    if (!word || STOPWORDS.has(word)) continue;
    counts[word] = (counts[word] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function updateStats() {
  const text = textInput ? textInput.value : "";

  const words = getWords(text);
  const sentences = getSentences(text);
  const paragraphs = getParagraphs(text);

  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpacesCount = text.replace(/\s/g, "").length;
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;

  const readingTime = wordCount / 200;
  const speakingTime = wordCount / 130;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  const longSentences = sentences.filter(sentence => getWords(sentence).length > 20);
  const topWords = getTopWords(words);

  if (wordCountEl) wordCountEl.textContent = wordCount;
  if (charCountEl) charCountEl.textContent = charCount;
  if (charNoSpacesCountEl) charNoSpacesCountEl.textContent = charNoSpacesCount;
  if (sentenceCountEl) sentenceCountEl.textContent = sentenceCount;
  if (paragraphCountEl) paragraphCountEl.textContent = paragraphCount;
  if (readingTimeEl) readingTimeEl.textContent = formatMinutes(readingTime);
  if (speakingTimeEl) speakingTimeEl.textContent = formatMinutes(speakingTime);
  if (avgSentenceLengthEl) avgSentenceLengthEl.textContent = avgSentenceLength.toFixed(1);

  if (longSentenceWarningEl) {
    if (!text.trim()) {
      longSentenceWarningEl.textContent = "No long sentences detected yet.";
    } else if (longSentences.length === 0) {
      longSentenceWarningEl.textContent = "Good job. No long sentences detected.";
    } else {
      longSentenceWarningEl.textContent =
        `You have ${longSentences.length} long sentence${longSentences.length > 1 ? "s" : ""}. Consider shortening ${longSentences.length > 1 ? "them" : "it"}.`;
    }
  }

  if (sentenceLengthNoteEl) {
    if (!text.trim()) {
      sentenceLengthNoteEl.textContent = "Add some text to see sentence insights.";
    } else if (avgSentenceLength > 20) {
      sentenceLengthNoteEl.textContent =
        "Your average sentence length is high. Shorter sentences are usually easier to read.";
    } else if (avgSentenceLength > 14) {
      sentenceLengthNoteEl.textContent =
        "Your sentence length looks balanced and reasonably easy to read.";
    } else {
      sentenceLengthNoteEl.textContent =
        "Your sentences are short and easy to scan.";
    }
  }

  if (topWordsListEl) {
    topWordsListEl.innerHTML = "";

    if (!text.trim() || topWords.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No words to analyze yet.";
      topWordsListEl.appendChild(li);
    } else {
      topWords.forEach(([word, count]) => {
        const li = document.createElement("li");
        li.textContent = `${word} (${count}x)`;
        topWordsListEl.appendChild(li);
      });
    }
  }
}

if (textInput) {
  textInput.addEventListener("input", updateStats);
  updateStats();
}

if (clearBtn && textInput) {
  clearBtn.addEventListener("click", () => {
    textInput.value = "";
    updateStats();
    textInput.focus();
  });
}

if (copyBtn && textInput) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(textInput.value || "");
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = "Copy Text";
      }, 1200);
    } catch {
      copyBtn.textContent = "Failed";
      setTimeout(() => {
        copyBtn.textContent = "Copy Text";
      }, 1200);
    }
  });
}