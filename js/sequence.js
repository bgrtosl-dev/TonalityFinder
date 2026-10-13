import { in53edo, in12edo, MAJ, MIN, DIM, AUGM, ROMAN, roman, BULLET, tuple, pairwise } from './constants.js';
import { Pitch } from './pitch.js';

export class Sequence {
    static d53_to_chords = {};

    constructor({ name, symb, d12, d53, upr_rmn, maj, min, dim, aug, inv, indx_fst }) {
        this.name = name;
        this.symb = symb;
        this.d12 = d12;
        this.d53 = d53;
        this.upr_rmn = upr_rmn;
        this.maj = maj;
        this.min = min;
        this.dim = dim;
        this.aug = aug;
        this.inv = inv;
        this.indx_fst = indx_fst;
    }

    static *itr(txt, name, symb, upr_rmn, maj = false, min = false, aug = false, dim = false) {
        const ptchs = Pitch.as_note_nt(txt, true);
        const ptchs2 = ptchs.concat(ptchs);
        const ln = ptchs.length;
        for (let inv = 0; inv < ln; inv++) {
            const ntes = ptchs2.slice(inv, inv + ln);

            const d53List = [];
            const d12List = [];
            for (const [p, n] of pairwise(ntes)) {
                d53List.push(in53edo(n.edo53 - p.edo53));
                d12List.push(in12edo(n.edo12 - p.edo12));
            }

            yield new Sequence({
                name, symb, d12: tuple(d12List), d53: tuple(d53List),
                inv, indx_fst: ((-inv % ln) + ln) % ln,
                upr_rmn, maj, min, dim, aug
            });
        }
    }

    static find(seq) {
        if (typeof seq === 'string') {
            seq = Pitch.as_note_nt(seq);
        }
        const d53List = [];
        for (const [p, n] of pairwise(seq)) {
            d53List.push(in53edo(n.edo53 - p.edo53));
        }
        return Sequence.d53_to_chords[tuple(d53List)];
    }

    static roman_numerals(notes, with_invrs = false) {
        const notes2 = notes.concat(notes);
        const rmn_nmrl = [];
        for (let deg = 0; deg < notes.length; deg++) {
            const trd = [notes[deg], notes2[deg + 2], notes2[deg + 4]];
            const d53List = [];
            for (const [p, n] of pairwise(trd)) {
                d53List.push(in53edo(n.sub(p)));
            }
            const triad = Sequence.d53_to_chords[tuple(d53List)];

            let rmnStr = '';
            if (triad.upr_rmn) {
                if (triad.symb === 'aug') {
                    rmnStr = ROMAN[deg] + AUGM;
                } else {
                    rmnStr = ROMAN[deg];
                }
            } else {
                if (triad.symb === 'dim') {
                    rmnStr = roman[deg] + DIM;
                } else {
                    rmnStr = roman[deg];
                }
            }
            if (with_invrs) {
                rmn_nmrl.push([rmnStr, BULLET.repeat(triad.inv)]);
            } else {
                rmn_nmrl.push(rmnStr);
            }
        }
        return rmn_nmrl;
    }

    static svnth_name(notes, with_invrs = false) {
        const notes2 = notes.concat(notes);
        const rmn_nmrl = [];
        for (let deg = 0; deg < notes.length; deg++) {
            const trd = [notes[deg], notes2[deg + 2], notes2[deg + 4], notes2[deg + 6]];
            const d53List = [];
            for (const [p, n] of pairwise(trd)) {
                d53List.push(in53edo(n.sub(p)));
            }
            const svnth = Sequence.d53_to_chords[tuple(d53List)];

            let rmnStr = `${deg}${svnth.symb}`;
            if (with_invrs) {
                rmn_nmrl.push([rmnStr, BULLET.repeat(svnth.inv)]);
            } else {
                rmn_nmrl.push(rmnStr);
            }
        }
        return rmn_nmrl;
    }

    get no_inversion() {
        return Object.values(Sequence.d53_to_chords).find(chrd => chrd.symb === this.symb && chrd.inv === 0);
    }

    get is_dim() {
        return this.symb === 'dim';
    }

    static populate() {
        const chrds = [
            // --- Triads ---
            ...Sequence.itr('C E G', 'Major', MAJ, true, true, false, false, false),
            ...Sequence.itr('C E G#', 'Augmented', AUGM, true, false, false, true, false),
            ...Sequence.itr('C Eb G', 'minor', MIN, false, false, true, false, false),
            ...Sequence.itr('C Eb Gb', 'diminished', DIM, false, false, false, false, true),

            // --- Seventh Chords ---
            ...Sequence.itr('C E G B', 'Major 7th', 'maj7', true, true, false, false, false),
            ...Sequence.itr('C E G Bb', 'Dominant 7th', '7', true, true, false, false, false),
            ...Sequence.itr('C Eb G Bb', 'Minor 7th', 'm7', false, false, true, false, false),
            ...Sequence.itr('C Eb G B', 'Minor-Major 7th', 'mM7', false, false, true, false, false),
            ...Sequence.itr('C Eb Gb Bb', 'Half-Diminished 7th', 'm7b5', false, false, false, false, true),
            ...Sequence.itr('C Eb Gb Bbb', 'Diminished 7th', 'dim7', false, false, false, false, true),
            ...Sequence.itr('C E G# B', 'Augmented Major 7th', 'maj7#5', true, true, false, true, false),
            ...Sequence.itr('C E G# Bb', 'Augmented Dominant 7th', '7#5', true, true, false, true, false)
        ];
        for (const c of chrds) {
            Sequence.d53_to_chords[c.d53] = c;
        }
        console.assert(chrds.length === Object.keys(Sequence.d53_to_chords).length && chrds.length === 44);
    }
}
