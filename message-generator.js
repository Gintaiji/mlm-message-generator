(function (global) {
  const KNOWN_PLATFORMS = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok"
  };

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

  function objectiveLine(objective) {
    const map = {
      discussion: "Je voulais juste ouvrir la conversation simplement.",
      question: "J’ai une question simple pour toi.",
      invitation: "Si tu veux, on peut échanger tranquillement.",
      relance7: "Je me permets un petit retour, sans pression.",
      relance14: "Je te laisse un dernier mot, sans pression."
    };
    return map[clean(objective)] || map.discussion;
  }

  function buildPersonalization(firstName, context) {
    const name = clean(firstName);
    const contextValue = clean(context);

    if (name) {
      return {
        greeting: `Salut ${name} !`,
        detailLine: "",
        usedName: true,
        usedContext: false
      };
    }

    if (contextValue) {
      return {
        greeting: "Salut !",
        detailLine: `On s’est croisés via ${contextValue}.`,
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

  function buildVariant(kind, data) {
    const { greeting, detailLine, platformLine, goalLine, safeLine, question } = data;

    if (kind === "short") {
      return joinSentences([greeting, detailLine || safeLine, goalLine, question]);
    }

    if (kind === "medium") {
      return joinSentences([greeting, platformLine, detailLine || safeLine, goalLine, question]);
    }

    return joinSentences([
      greeting,
      platformLine,
      detailLine || safeLine,
      "Message simple, sans pression 🙂",
      goalLine,
      question
    ]);
  }

  function generateNaturalMessageVariants(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError("input must be an object");
    }

    const platformLabel = normalizePlatformName(input.plateforme);
    const personalization = buildPersonalization(input.prenom, input.contexte);
    const goalLine = objectiveLine(input.objectif);
    const contextMissing = !personalization.usedContext && !clean(input.contexte);

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

    return {
      short: buildVariant("short", data),
      medium: buildVariant("medium", data),
      fun: buildVariant("fun", data),
      meta: {
        platformFallbackUsed: !platformLabel,
        contextMissing,
        personalization: personalization.usedName ? "prenom" : personalization.usedContext ? "contexte" : "none"
      }
    };
  }

  global.NaturalMessageGenerator = {
    generateNaturalMessageVariants,
    normalizePlatformName
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.NaturalMessageGenerator;
  }
})(typeof window !== "undefined" ? window : globalThis);
