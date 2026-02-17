import test from 'node:test';
import assert from 'node:assert/strict';
import generator from '../message-generator.js';

const { generateNaturalMessageVariants } = generator;

const FORBIDDEN_WORDS = /\b(opportunité|business|revenus?|recruter|équipe|urgent|vite|garanti|MLM)\b/i;

function emojiCount(text) {
  const matches = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
  return matches ? matches.length : 0;
}

function allVariants(variants) {
  return [variants.short, variants.medium, variants.fun];
}

test('génère 3 variantes et finit toujours par une question binaire', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Julie',
    plateforme: 'Instagram',
    contexte: 'ton commentaire',
    objectif: 'invitation'
  });

  assert.equal(allVariants(variants).length, 3);
  for (const text of allVariants(variants)) {
    assert.match(text, /Tu préfères/i);
    assert.match(text, /\?\s*$/);
  }
});

test('personnalisation légère: si prénom présent, le contexte n’est pas injecté', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Julie',
    plateforme: 'Instagram',
    contexte: 'ton commentaire sur la routine',
    objectif: 'discussion'
  });

  assert.equal(variants.meta.personalization, 'prenom');
  assert.match(variants.short, /Salut Julie !/);
  assert.doesNotMatch(variants.short, /routine|commentaire/i);
});

test('prénom manquant => salutation neutre', () => {
  const variants = generateNaturalMessageVariants({
    prenom: '',
    plateforme: 'Facebook',
    contexte: 'ton post',
    objectif: 'discussion'
  });

  assert.ok(variants.short.startsWith('Salut !'));
});

test('plateforme inconnue => fallback générique', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Lina',
    plateforme: 'LinkedIn',
    contexte: 'tes publications',
    objectif: 'question'
  });

  assert.equal(variants.meta.platformFallbackUsed, true);
  assert.match(variants.medium, /Je t’écris ici avec un message simple\./);
});

test('contexte vide => mode safe + question de clarification', () => {
  const variants = generateNaturalMessageVariants({
    prenom: '',
    plateforme: 'TikTok',
    contexte: ' ',
    objectif: 'discussion'
  });

  assert.equal(variants.meta.contextMissing, true);
  assert.match(variants.short, /pas assez de contexte/i);
  assert.match(variants.short, /Tu préfères me donner un peu de contexte/i);
});

test('contraintes copywriting: mots interdits absents + emoji seulement fun', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Nora',
    plateforme: 'Instagram',
    contexte: 'ton reel',
    objectif: 'relance7'
  });

  for (const [index, text] of allVariants(variants).entries()) {
    assert.doesNotMatch(text, FORBIDDEN_WORDS);
    if (index < 2) assert.equal(emojiCount(text), 0);
    if (index === 2) assert.ok(emojiCount(text) <= 1);
  }
});

test('erreur claire si input invalide', () => {
  assert.throws(() => generateNaturalMessageVariants(null), TypeError);
});
