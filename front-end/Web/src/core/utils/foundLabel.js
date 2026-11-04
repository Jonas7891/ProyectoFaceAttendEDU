// Texto "N <cosas> encontrad[a|o]s" con el singular correcto.
// Antes se derivaba el singular recortando la última letra del plural
// ("profesores".slice(0, -1) -> "profesore"); ahora se usa el singular propio.
export function foundLabel(count, { singular, plural }, { found, foundPlural }) {
    return count === 1
        ? `${count} ${singular} ${found}`
        : `${count} ${plural} ${foundPlural}`;
}
