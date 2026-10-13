import { Scale, PitchSet } from './scale.js';

export function gui_usr2tonalities(keySig, notes) {
    try {
        const notesStr = Array.isArray(notes) ? notes.join(' ') : (notes || '');

        // PitchSet parses valid notes and ignores any containing '?'
        const usr = new PitchSet(notesStr);

        // Identify skipped notes (those marked with '?')
        const parts = notesStr.trim().split(/\s+/);
        const skipped = parts.filter(n => n.includes('?')).map(n => n.replace(/\?/g, ''));

        const maj = Scale.key2maj(keySig);
        const majAlterations = maj ? maj.white2alteration : {};
        const usrAlterations = usr.white2alteration;

        // Exclude notes that are explicitly skipped (?) or overridden by user
        const maj2alt = {};
        for (const [k, v] of Object.entries(majAlterations)) {
            if (!skipped.includes(k) && !(k in usrAlterations)) {
                maj2alt[k] = v;
            }
        }

        const combined = { ...maj2alt, ...usrAlterations };

        const queryStr = Object.entries(combined)
            .map(([n, a]) => `${n}${a}`)
            .join(' ');

        const scales = Scale.find(queryStr);
        if (Array.isArray(scales)) return scales;

        return [];
    } catch (err) {
        return [];
    }
}
