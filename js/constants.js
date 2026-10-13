export const DIA_COMMA = 4;
export const CHROM_COMMA = 5;
export const TONE_COMMA = DIA_COMMA + CHROM_COMMA; // 9
export const OCTV_53EDO = 5 * TONE_COMMA + 2 * DIA_COMMA; // 53
export const OCTV_12EDO = 12;

export const MAJ_3RD_COMMA = TONE_COMMA * 2;
export const MIN_3RD_COMMA = TONE_COMMA + DIA_COMMA;
export const FIFTH_COMMA = 3 * TONE_COMMA + DIA_COMMA;

export const NATURAL = '♮';
export const FLAT = '♭';
export const SHARP = '♯';
export const DBLSHARP = '𝄪';
export const UNICODE_ALTERATIONS = "♮♭♯𝄪";

export const MAJ = 'maj';
export const MIN = 'min';
export const MIN_MLD = 'min_mld';
export const MIN_HRM = 'min_hrm';

export const BULLET = '•';
export const DIM = '°';
export const HALF_DIM = 'ø';
export const AUGM = '⁺';

export const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export function in53edo(n, octv = OCTV_53EDO) {
    return n % octv;
}

export function in12edo(n, octv = OCTV_12EDO) {
    return n % octv;
}

export function chrd_nt(chords, roman, inv) {
    return { chords, roman, inv };
}

// Tuple helper for dictionary/map keys
export function tuple(arr) {
    return JSON.stringify(arr);
}

// --- Itertools Equivalents ---
export function* pairwise(iterable) {
    const iterator = iterable[Symbol.iterator]();
    let prev = iterator.next();
    if (prev.done) return;
    let curr = iterator.next();
    while (!curr.done) {
        yield [prev.value, curr.value];
        prev = curr;
        curr = iterator.next();
    }
}

export function* groupby(iterable, keyFn = x => x) {
    let currentKey = null;
    let group = [];
    for (const item of iterable) {
        const key = keyFn(item);
        if (currentKey === null || key === currentKey) {
            group.push(item);
            currentKey = key;
        } else {
            yield [currentKey, group];
            group = [item];
            currentKey = key;
        }
    }
    if (group.length > 0) {
        yield [currentKey, group];
    }
}
