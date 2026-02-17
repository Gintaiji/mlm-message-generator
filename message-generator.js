(function (global) {
  const KNOWN_PLATFORMS = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok"
  };

  const FORBIDDEN_WORDS = [
    "mlm",
    "opportunité",
    "business",
    "revenu",
    "revenus",
    "recruter",
    "équipe"
  ];

  const BINARY_QUESTIONS = {
    knownPlatform: (platform) => `Tu préfères qu’on continue ici sur ${platform} ou demain ?`,
    generic: "Tu préfères qu’on continue ici ou demain ?",
    missingContext: "Tu préfères me donner un peu de contexte, ou que je reste sur un message très simple ?"
  };

  function clean(value) {
    return String(value || "").trim();
  }

  function normalizePlatformName(platform) {
    const normalized = clean(platform).toLowerCase();
    return KNOWN_PLATFORMS[normalized] || null;
  }

  function normalizeInput(input) {
    return {
      firstName: clean(input.firstName || input.prenom),
      platform: clean(input.platform || input.plateforme),
      context: clean(input.context || input.contexte),
      goal: clean(input.goal || input.objectif)
    };
  }

  function objectiveLine(goal) {
    const map = {
      discussion: "Je voulais juste ouvrir la conversation simplement.",
      question: "J’ai une question simple pour toi.",
      invitation: "Si tu veux, on peut échanger tranquillement.",
      relance7: "Je me permets un petit retour, sans pression.",
      relance14: "Je te laisse un dernier mot, sans pression."
    };
    return map[goal] || map.discussion;
  }

  function removeForbiddenWords(text) {
    let output = text;
    FORBIDDEN_WORDS.forEach((word) => {
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      output = output.replace(pattern, "").replace(/\s{2,}/g, " ").trim();
    });
    return output;
  }

  function buildPersonalization(firstName, context) {
    if (firstName) {
      return {
        greeting: `Salut ${firstName} !`,
        detailLine: "",
        usedName: true,
        usedContext: false
      };
    }

    if (context) {
      return {
        greeting: "Salut !",
        detailLine: `On s’est croisés via ${removeForbiddenWords(context)}.`,
        usedName: false,
        usedContext: true
      };
    }

    return {
      greeting: "Salut !",
      detailLine: "",
      usedName: false,
      usedContext: false
    };
  }

  function closingQuestion(platformLabel, contextMissing) {
    if (contextMissing) return BINARY_QUESTIONS.missingContext;
    if (platformLabel) return BINARY_QUESTIONS.knownPlatform(platformLabel);
    return BINARY_QUESTIONS.generic;
  }

  function joinSentences(parts) {
    return parts.filter(Boolean).join(" ");
  }

  function spamScore(message) {
    const text = clean(message);
    if (!text) return 0;

    let score = 0;

    const emojiMatches = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || [];
    if (emojiMatches.length > 1) score += (emojiMatches.length - 1) * 12;

    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 1) score += (exclamations - 1) * 8;

    const lower = text.toLowerCase();
    FORBIDDEN_WORDS.forEach((word) => {
      if (lower.includes(word)) score += 30;
    });

    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    sentences.forEach((sentence) => {
      const words = sentence.split(/\s+/).filter(Boolean).length;
      if (words > 18) score += Math.min((words - 18) * 1.5, 20);
    });

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function buildVariant(kind, data) {
    const { greeting, detailLine, platformLine, goalLine, safeLine, question } = data;
    const contextOrSafe = detailLine || safeLine;

    if (kind === "short") {
      return joinSentences([greeting, contextOrSafe || goalLine, question]);
    }

    if (kind === "medium") {
      const core = contextOrSafe || platformLine;
      return joinSentences([greeting, core, question]);
    }

    const funLine = contextOrSafe || "Petit message rapide 🙂";
    return joinSentences([greeting, funLine, question]);
  }

  function buildSoberVariant(kind, data) {
    const { greeting, question, safeLine } = data;
    if (kind === "short") {
      return joinSentences([greeting, safeLine || "Je te laisse un mot rapide.", question]);
    }
    if (kind === "medium") {
      return joinSentences([greeting, safeLine || "Je viens en direct.", question]);
    }
    return joinSentences([greeting, safeLine || "Je reste court.", question]);
  }

  function applySpamGuard(variantMap, data) {
    const result = {};
    const scores = {};
    const regenerated = {};

    ["short", "medium", "fun"].forEach((kind) => {
      const sanitized = removeForbiddenWords(variantMap[kind]);
      const score = spamScore(sanitized);
      if (score > 35) {
        const sober = removeForbiddenWords(buildSoberVariant(kind, data));
        result[kind] = sober;
        scores[kind] = spamScore(sober);
        regenerated[kind] = true;
      } else {
        result[kind] = sanitized;
        scores[kind] = score;
        regenerated[kind] = false;
      }
    });

    return { result, scores, regenerated };
  }

  function messageGenerator(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError("input must be an object");
    }

    const normalized = normalizeInput(input);
    const platformLabel = normalizePlatformName(normalized.platform);
    const personalization = buildPersonalization(normalized.firstName, normalized.context);
    const goalLine = objectiveLine(normalized.goal);
    const contextMissing = !personalization.usedContext && !normalized.context;

    const data = {
      greeting: personalization.greeting,
      detailLine: personalization.detailLine,
      platformLine: platformLabel
        ? `Je t’écris via ${platformLabel}.`
        : "Je t’écris ici avec un message simple.",
      goalLine,
      safeLine: contextMissing
        ? "Je n’ai pas assez de contexte, donc je reste direct et respectueux."
        : "",
      question: closingQuestion(platformLabel, contextMissing)
    };

    const initialVariants = {
      short: buildVariant("short", data),
      medium: buildVariant("medium", data),
      fun: buildVariant("fun", data)
    };

    const guard = applySpamGuard(initialVariants, data);

    return {
      short: guard.result.short,
      medium: guard.result.medium,
      fun: guard.result.fun,
      meta: {
        platformFallbackUsed: !platformLabel,
        contextMissing,
        personalization: personalization.usedName ? "firstName" : personalization.usedContext ? "context" : "none",
        spamScores: guard.scores,
        regenerated: guard.regenerated
      }
    };
  }

  global.NaturalMessageGenerator = {
    messageGenerator,
    generateNaturalMessageVariants: messageGenerator,
    normalizePlatformName,
    spamScore
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.NaturalMessageGenerator;
  }
})(typeof window !== "undefined" ? window : globalThis);
