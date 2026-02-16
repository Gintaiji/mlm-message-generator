import test from 'node:test';
import assert from 'node:assert/strict';
import generator from '../message-generator.js';

const { generateNaturalMessageVariants } = generator;

function emojiCount(text) {
  const matches = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu);
  return matches ? matches.length : 0;
}

function allVariants(variants) {
  return [variants.short, variants.medium, variants.fun];
}

test('génère 3 variantes naturelles avec question finale', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Julie',
    plateforme: 'Instagram',
    contexte: 'ton commentaire sur la routine',
    objectif: 'invitation'
  });

  assert.ok(variants.short.includes('Salut Julie !'));
  assert.equal(allVariants(variants).length, 3);

  for (const text of allVariants(variants)) {
    assert.match(text, /\?\s*$/);
  }
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
  assert.ok(variants.medium.includes('ta plateforme'));
});

test('contexte vide => mode safe + question de clarification', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Marc',
    plateforme: 'TikTok',
    contexte: ' ',
    objectif: 'discussion'
  });

  assert.equal(variants.meta.contextMissing, true);
  assert.match(variants.short, /contexte/i);
  assert.match(variants.short, /Tu préfères me dire/i);
});

test('contraintes copywriting: pas de MLM/gains + max 1 emoji', () => {
  const variants = generateNaturalMessageVariants({
    prenom: 'Nora',
    plateforme: 'Instagram',
    contexte: 'ton reel',
    objectif: 'relance7'
  });

  for (const text of allVariants(variants)) {
    assert.doesNotMatch(text, /\bMLM\b/i);
    assert.doesNotMatch(text, /gains?/i);
    assert.ok(emojiCount(text) <= 1);
  }
});

test('erreur claire si input invalide', () => {
  assert.throws(() => generateNaturalMessageVariants(null), TypeError);
});
