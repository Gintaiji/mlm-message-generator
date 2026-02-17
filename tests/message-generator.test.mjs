import test from 'node:test';
import assert from 'node:assert/strict';
import generator from '../message-generator.js';

const { messageGenerator, spamScore } = generator;
const FORBIDDEN = /\b(mlm|opportunité|business|revenus?|recruter|équipe)\b/i;

function allVariants(variants) {
  return [variants.short, variants.medium, variants.fun];
}

test('prénom absent -> salutation neutre', () => {
  const variants = messageGenerator({
    firstName: '',
    platform: 'Instagram',
    context: 'ton commentaire',
    goal: 'discussion'
  });

  assert.match(variants.short, /^Salut !/);
});

test('contexte absent -> mode safe', () => {
  const variants = messageGenerator({
    firstName: 'Julie',
    platform: 'Facebook',
    context: '',
    goal: 'question'
  });

  assert.equal(variants.meta.contextMissing, true);
  assert.match(variants.short, /pas assez de contexte/i);
});

test('plateforme inconnue -> fallback générique', () => {
  const variants = messageGenerator({
    firstName: 'Lina',
    platform: 'LinkedIn',
    context: 'ton post',
    goal: 'invitation'
  });

  assert.equal(variants.meta.platformFallbackUsed, true);
  assert.match(variants.medium, /Je t’écris ici avec un message simple\./);
});

test('spamScore pénalise emojis, !, mots interdits et longues phrases', () => {
  const msg = 'Salut !!! 😀😀😀 Cette opportunité business donne des revenus rapides et ce message est volontairement très long pour dépasser largement la taille recommandée et gonfler le score.';
  assert.ok(spamScore(msg) > 35);
});

test('spamScore > 35 déclenche la régénération sobre', () => {
  const variants = messageGenerator({
    firstName: '',
    platform: 'Instagram',
    context: 'opportunité !!! 😀😀😀 avec une phrase vraiment beaucoup trop longue pour rester naturelle et qui continue encore pour forcer une note de spam élevée',
    goal: 'discussion'
  });

  assert.equal(variants.meta.regenerated.short, true);
  assert.ok(variants.meta.spamScores.short <= 35);
});

test('conformité: aucune variante ne contient de mots interdits', () => {
  const variants = messageGenerator({
    firstName: '',
    platform: 'TikTok',
    context: 'business mlm',
    goal: 'relance7'
  });

  for (const text of allVariants(variants)) {
    assert.doesNotMatch(text, FORBIDDEN);
  }
});
