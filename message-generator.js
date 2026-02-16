(function (global) {
  const KNOWN_PLATFORMS = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok"
  };

  function clean(value) {
    return String(value || "").trim();
  }

  function normalizePlatformName(platform) {
    const normalized = clean(platform).toLowerCase();
    return KNOWN_PLATFORMS[normalized] || null;
  }

  function safeGreeting(firstName) {
    const name = clean(firstName);
    return name ? `Salut ${name} !` : "Salut !";
  }

  function objectiveLine(objective) {
    const map = {
      discussion: "J’avais envie d’ouvrir la discussion simplement.",
      question: "J’ai une petite question rapide à te poser.",
      invitation: "Si tu es ok, on peut se caler un court échange.",
      relance7: "Je te fais une relance légère, au cas où mon message soit passé à côté.",
      relance14: "Je reviens une dernière fois, sans pression."
    };
    return map[clean(objective)] || map.discussion;
  }

  function contextLine(context) {
    const cleaned = clean(context);
    if (!cleaned) {
      return {
        missing: true,
        value: "Je n’ai pas encore beaucoup de contexte, donc je préfère un message simple et respectueux."
      };
    }

    return {
      missing: false,
      value: `On s’est croisés via ${cleaned}, et ça m’a donné envie de t’écrire.`
    };
  }

  function closingQuestion(platformLabel, isContextMissing) {
    if (isContextMissing) {
      return "Tu préfères me dire en une phrase ton contexte du moment, ou que je t’envoie une version encore plus courte ?";
    }

    if (platformLabel) {
      return `Tu préfères qu’on continue ici sur ${platformLabel} ou en vocal rapide ?`;
    }

    return "Tu préfères qu’on continue ici ou en vocal rapide ?";
  }

  function buildVariant(parts, kind) {
    const { greeting, platformLabel, context, objective, question } = parts;
    const genericPlatform = platformLabel || "ta plateforme";

    if (kind === "court") {
      return [
        greeting,
        `${context}`,
        `${objective}`,
        `${question}`
      ].join(" ");
    }

    if (kind === "moyen") {
      return [
        greeting,
        `Je t’écris depuis ${genericPlatform} avec un message naturel, sans copier-coller.`,
        context,
        objective,
        question
      ].join(" ");
    }

    return [
      greeting,
      `Petit message spontané 🙂 depuis ${genericPlatform}.`,
      context,
      "Promis, je fais simple et humain.",
      objective,
      question
    ].join(" ");
  }

  function generateNaturalMessageVariants(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError("input must be an object");
    }

    const platformLabel = normalizePlatformName(input.plateforme);
    const context = contextLine(input.contexte);
    const objective = objectiveLine(input.objectif);
    const greeting = safeGreeting(input.prenom);
    const question = closingQuestion(platformLabel, context.missing);

    const parts = {
      greeting,
      platformLabel,
      context: context.value,
      objective,
      question
    };

    return {
      short: buildVariant(parts, "court"),
      medium: buildVariant(parts, "moyen"),
      fun: buildVariant(parts, "fun"),
      meta: {
        platformFallbackUsed: !platformLabel,
        contextMissing: context.missing
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
