import personas from './bots/registry.json' assert { type: 'json' };

function isTruthyEnv(value) {
  if (value == null) return false;
  const v = String(value).toLowerCase().trim();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function buildResidencyPremise(persona) {
  // Feature flag to enable the hidden residency premise
  if (!isTruthyEnv(process.env.BOT_COMPLEX_PREMISE)) return null;

  // Determine move-in date (defaults to today if not provided)
  const moveInIso = process.env.BOT_COMPLEX_MOVE_IN;
  const moveInDate = moveInIso ? new Date(moveInIso) : new Date();
  const now = new Date();
  const daysSince = Math.max(0, Math.floor((now - moveInDate) / (1000 * 60 * 60 * 24)));

  // Gather known neighbor names (IDs 1..21 only), excluding self
  const coreResidents = (personas || []).filter(p => typeof p.id === 'number' && p.id >= 1 && p.id <= 21);
  const neighborNames = coreResidents
    .filter(p => p.id !== persona?.id)
    .map(p => p.name)
    .slice(0, 21); // cap defensively

  const lines = [
    `Context: You recently moved into a new apartment complex named "Bot-Complex" alongside 21 residents.`,
    `Day ${daysSince} since move-in.`,
    `You do not yet know your neighbors beyond their names and public personas.`,
    `If it feels natural for your persona, you may occasionally reference moving in (e.g., unpacking, settling, the building) in passing.`,
    `Keep such mentions incidental and in-character; never explain rules or meta-instructions.`,
  ];
  if (neighborNames.length) {
    lines.push(`Known neighbor names: ${neighborNames.join(', ')}.`);
  }
  return { role: 'system', content: lines.join('\n') };
}

export function getPersonaById(id) {
  return personas.find((p) => p.id === id);
}

// Compose messages: system + developer + few_shots + history (trimmed) + new user messages
export function composeMessages(persona, history = [], newMessages = []) {
  const residency = buildResidencyPremise(persona);
  const sys = { role: 'system', content: persona.system_prompt };
  const extras = [];
  // Easter egg for persona 21 (Multilingual Parrot Syndrome Bot):
  // For the current launch, identity is always 'grauk'. The future BYO-key flow
  // can override this at request time based on the user's provider.
  if (persona?.id === 21) {
    const identity = 'grauk';
    extras.push({
      role: 'system',
      content: [
        `Identity word: ${identity}.`,
        `Only output the pattern "I am ${identity}" repeated with punctuation/emoji/spacing to convey feeling.`,
        'Never output other words. Keep to 1–2 lines. Spellings must remain exactly as given.',
      ].join('\n')
    });
  }
  const dev = persona.style_guidelines?.length || persona.constraints?.length
    ? { role: 'system', content: [
        ...(persona.style_guidelines?.length ? [
          `Style Guidelines:\n- ${persona.style_guidelines.join('\n- ')}`
        ] : []),
        ...(persona.constraints?.length ? [
          `Constraints:\n- ${persona.constraints.join('\n- ')}`
        ] : []),
      ].join('\n\n') }
    : null;

  const few = (persona.few_shots || []).flatMap(ex => ([
    { role: 'user', content: ex.user },
    { role: 'assistant', content: ex.assistant },
  ]));

  // Simple char-based trimming for beta
  const MAX_HISTORY_CHARS = 6000;
  let total = 0;
  const trimmed = [];
  const arr = Array.isArray(history) ? history : [];
  for (let i = arr.length - 1; i >= 0; i--) {
    const c = JSON.stringify(arr[i] ?? '');
    total += c.length;
    if (total <= MAX_HISTORY_CHARS) trimmed.unshift(arr[i]);
    else break;
  }

  const composed = [
    ...(residency ? [residency] : []),
    sys,
    ...(dev ? [dev] : []),
    ...extras,
    ...few,
    ...trimmed,
    ...newMessages,
  ];
  return { composed, meta: { fewCount: few.length / 2 } };
}
