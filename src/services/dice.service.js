/**
 * Sistema de tiradas de dados configurable.
 * Soporta: dN, XdN, XdN+mod, XdNkhY (keep highest), d% (d100).
 */
const DICE_RE =
  /^(?<count>\d+)?d(?<sides>\d+|%)(?:(?<keep>kh)(?<keepCount>\d+))?(?<mod>[+-]\d+)?$/i;

export function roll(formula) {
  const parsed = parseFormula(formula);
  if (!parsed) throw new Error(`Formula de dado invalida: ${formula}`);

  const { count, sides, keepCount, modifier } = parsed;
  const results = [];

  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }

  let kept = [...results];
  if (keepCount && keepCount < count) {
    kept = [...results].sort((a, b) => b - a).slice(0, keepCount);
  }

  const subtotal = kept.reduce((sum, v) => sum + v, 0);
  const total = subtotal + (modifier ?? 0);

  return {
    formula,
    results,
    kept: keepCount ? kept : undefined,
    modifier: modifier ?? 0,
    subtotal,
    total,
    criticalHit: sides >= 20 && results.some((r) => r >= sides),
    criticalMiss: sides >= 20 && results.some((r) => r === 1 && count === 1),
  };
}

function parseFormula(formula) {
  const normalized = String(formula).trim().toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(DICE_RE);
  if (!match) {
    if (normalized === "d%") {
      return { count: 1, sides: 100, modifier: 0, keepCount: null };
    }
    return null;
  }

  const { count, sides, keep, keepCount, mod } = match.groups;
  return {
    count: count ? Number(count) : 1,
    sides: sides === "%" ? 100 : Number(sides),
    keepCount: keep ? Number(keepCount) : null,
    modifier: mod ? Number(mod) : 0,
  };
}

export function rollCheck(statValue, difficulty = 10) {
  const { formula, results, total, criticalHit, criticalMiss } = roll("d20");
  const modifier = Math.floor((statValue - 10) / 2);
  const finalTotal = total + modifier;

  return {
    formula,
    roll: results[0],
    modifier,
    total: finalTotal,
    difficulty,
    success: criticalHit
      ? "critical"
      : criticalMiss
        ? "fumble"
        : finalTotal >= difficulty
          ? "success"
          : "failure",
    criticalHit,
    criticalMiss,
    description: describeCheck(
      finalTotal,
      difficulty,
      criticalHit,
      criticalMiss,
    ),
  };
}

function describeCheck(total, difficulty, crit, fumble) {
  if (crit) return "Exito critico. La accion tiene un resultado espectacular.";
  if (fumble) return "Fallo critico. Algo sale terriblemente mal.";
  if (total >= difficulty + 10) return "Exito rotundo.";
  if (total >= difficulty) return "Exito.";
  if (total >= difficulty - 3)
    return "Exito ajustado, con complicaciones menores.";
  return "Fallo. La accion no tiene el efecto deseado.";
}
