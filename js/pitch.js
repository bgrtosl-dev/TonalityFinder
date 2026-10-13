import { in53edo, groupby } from './constants.js';

export class Pitch {
    static C = null;
    static A = null;
    static altrn_cnt = { '': 0, '#': 1, 'x': 2, 'b': -1, 'bb': -2 };
    static pitches = [];
    static to_pitch = {};
    static edo53_to_edo12 = {};
    static edo12_to_edo53 = {};
    static eng2in5th = {};

    constructor({ eng, edo53, in5th, edo12, white, alt, enh_sharp, enh_flat }) {
        this.eng = eng;
        this.edo53 = edo53;
        this.in5th = in5th;
        this.edo12 = edo12;
        this.white = white;
        this.alt = alt;
        this.enh_sharp = enh_sharp;
        this.enh_flat = enh_flat;
    }

    get white_pitch() {
        return Pitch.to_pitch[this.white];
    }

    get altrn() {
        return Pitch.altrn_cnt[this.alt] || 0;
    }

    get as_enh_flat() {
        return Pitch.to_pitch[this.enh_flat];
    }

    get as_enh_sharp() {
        return Pitch.to_pitch[this.enh_sharp];
    }

    add(other) {
        return Pitch.to_pitch[in53edo(this.edo53 + other)];
    }

    sub(other) {
        return this.edo53 - other.edo53;
    }

    lt(other) {
        return this.in5th < other.in5th;
    }

    valueOf() {
        return this.edo53;
    }

    static in_edo12(ptch_list) {
        return ptch_list.map(ptch => Pitch.to_pitch[ptch.edo12]);
    }

    static as_note_nt(txt, as_tuple = false) {
        txt = txt.replace(/–/g, ' ')
                 .replace(/-/g, ' ')
                 .replace(/,/g, ' ')
                 .replace(/♭/g, 'b')
                 .replace(/♯/g, '#');

        // Filter out any tokens containing '?' (unselected/bypassed notes)
        const parts = txt.trim().split(/\s+/).filter(n => n && !n.includes('?'));
        const as_nt = parts.map(n => Pitch.to_pitch[n]).filter(Boolean);

        if (as_tuple || as_nt.length > 1) {
            return as_nt;
        } else {
            return as_nt[0] || null;
        }
    }

    static populate() {
        const rawData = [
            { eng: 'C', edo53: 0, in5th: 0, edo12: 0, white: 'C', alt: '', enh_sharp: 'C', enh_flat: 'C' },
            { eng: 'F', edo53: 22, in5th: -1, edo12: 5, white: 'F', alt: '', enh_sharp: 'F', enh_flat: 'F' },
            { eng: 'G', edo53: 31, in5th: 1, edo12: 7, white: 'G', alt: '', enh_sharp: 'G', enh_flat: 'G' },
            { eng: 'Bb', edo53: 44, in5th: -2, edo12: 10, white: 'B', alt: 'b', enh_sharp: 'A#', enh_flat: 'Bb' },
            { eng: 'D', edo53: 9, in5th: 2, edo12: 2, white: 'D', alt: '', enh_sharp: 'D', enh_flat: 'D' },
            { eng: 'Eb', edo53: 13, in5th: -3, edo12: 3, white: 'E', alt: 'b', enh_sharp: 'D#', enh_flat: 'Eb' },
            { eng: 'A', edo53: 40, in5th: 3, edo12: 9, white: 'A', alt: '', enh_sharp: 'A', enh_flat: 'A' },
            { eng: 'Ab', edo53: 35, in5th: -4, edo12: 8, white: 'A', alt: 'b', enh_sharp: 'G#', enh_flat: 'Ab' },
            { eng: 'E', edo53: 18, in5th: 4, edo12: 4, white: 'E', alt: '', enh_sharp: 'E', enh_flat: 'E' },
            { eng: 'Db', edo53: 4, in5th: -5, edo12: 1, white: 'D', alt: 'b', enh_sharp: 'C#', enh_flat: 'Db' },
            { eng: 'B', edo53: 49, in5th: 5, edo12: 11, white: 'B', alt: '', enh_sharp: 'B', enh_flat: 'B' },
            { eng: 'Gb', edo53: 26, in5th: -6, edo12: 6, white: 'G', alt: 'b', enh_sharp: 'F#', enh_flat: 'Gb' },
            { eng: 'F#', edo53: 27, in5th: 6, edo12: 6, white: 'F', alt: '#', enh_sharp: 'F#', enh_flat: 'Gb' },
            { eng: 'Cb', edo53: 48, in5th: -7, edo12: 11, white: 'C', alt: 'b', enh_sharp: 'B', enh_flat: 'B' },
            { eng: 'C#', edo53: 5, in5th: 7, edo12: 1, white: 'C', alt: '#', enh_sharp: 'C#', enh_flat: 'Db' },
            { eng: 'Fb', edo53: 17, in5th: -8, edo12: 4, white: 'F', alt: 'b', enh_sharp: 'E', enh_flat: 'E' },
            { eng: 'G#', edo53: 36, in5th: 8, edo12: 8, white: 'G', alt: '#', enh_sharp: 'G#', enh_flat: 'Ab' },
            { eng: 'Bbb', edo53: 39, in5th: -9, edo12: 9, white: 'B', alt: 'bb', enh_sharp: 'A', enh_flat: 'A' },
            { eng: 'D#', edo53: 14, in5th: 9, edo12: 3, white: 'D', alt: '#', enh_sharp: 'D#', enh_flat: 'Eb' },
            { eng: 'Ebb', edo53: 8, in5th: -10, edo12: 2, white: 'E', alt: 'bb', enh_sharp: 'D', enh_flat: 'D' },
            { eng: 'A#', edo53: 45, in5th: 10, edo12: 10, white: 'A', alt: '#', enh_sharp: 'A#', enh_flat: 'Bb' },
            { eng: 'Abb', edo53: 30, in5th: -11, edo12: 7, white: 'A', alt: 'bb', enh_sharp: 'G', enh_flat: 'G' },
            { eng: 'E#', edo53: 23, in5th: 11, edo12: 5, white: 'E', alt: '#', enh_sharp: 'F', enh_flat: 'F' },
            { eng: 'Dbb', edo53: 52, in5th: -12, edo12: 0, white: 'D', alt: 'bb', enh_sharp: 'C', enh_flat: 'C' },
            { eng: 'B#', edo53: 1, in5th: 12, edo12: 0, white: 'B', alt: '#', enh_sharp: 'C', enh_flat: 'C' },
            { eng: 'Gbb', edo53: 21, in5th: -13, edo12: 5, white: 'G', alt: 'bb', enh_sharp: 'F', enh_flat: 'F' },
            { eng: 'Fx', edo53: 32, in5th: 13, edo12: 7, white: 'F', alt: 'x', enh_sharp: 'G', enh_flat: 'G' },
            { eng: 'Cbb', edo53: 43, in5th: -14, edo12: 10, white: 'C', alt: 'bb', enh_sharp: 'A#', enh_flat: 'Bb' },
            { eng: 'Cx', edo53: 10, in5th: 14, edo12: 2, white: 'C', alt: 'x', enh_sharp: 'D', enh_flat: 'D' },
            { eng: 'Fbb', edo53: 12, in5th: -15, edo12: 3, white: 'F', alt: 'bb', enh_sharp: 'D#', enh_flat: 'Eb' },
            { eng: 'Gx', edo53: 41, in5th: 15, edo12: 9, white: 'G', alt: 'x', enh_sharp: 'A', enh_flat: 'A' },
            { eng: 'Dx', edo53: 19, in5th: 16, edo12: 4, white: 'D', alt: 'x', enh_sharp: 'E', enh_flat: 'E' },
            { eng: 'Ax', edo53: 50, in5th: 17, edo12: 11, white: 'A', alt: 'x', enh_sharp: 'B', enh_flat: 'B' },
            { eng: 'Ex', edo53: 28, in5th: 18, edo12: 6, white: 'E', alt: 'x', enh_sharp: 'F#', enh_flat: 'Gb' },
            { eng: 'Bx', edo53: 6, in5th: 19, edo12: 1, white: 'B', alt: 'x', enh_sharp: 'C#', enh_flat: 'Db' }
        ];

        Pitch.pitches = rawData.map(d => new Pitch(d));

        const sortedByEng = [...Pitch.pitches].sort((a, b) => a.eng.localeCompare(b.eng));
        const sortedByEdo53 = [...Pitch.pitches].sort((a, b) => a.edo53 - b.edo53);

        for (const p of sortedByEng) Pitch.to_pitch[p.eng] = p;
        for (const p of sortedByEdo53) Pitch.to_pitch[p.edo53] = p;

        for (const ptch of sortedByEdo53) {
            Pitch.edo53_to_edo12[ptch.edo53] = ptch.edo12;
        }

        const sortedForGroup = [...Pitch.pitches].sort((a, b) => (a.edo12 - b.edo12) || (a.edo53 - b.edo53));
        for (const [e12, g] of groupby(sortedForGroup, p => p.edo12)) {
            Pitch.edo12_to_edo53[e12] = g.map(p => p.edo53);
        }

        for (const n of Pitch.pitches) {
            Pitch.eng2in5th[n.eng] = n.in5th;
        }

        Pitch.A = Pitch.as_note_nt('A');
        Pitch.C = Pitch.as_note_nt('C');
    }
}

export class PitchSet {
    constructor(pitches) {
        if (typeof pitches === 'string') {
            this.pitches = Pitch.as_note_nt(pitches, true);
        } else {
            this.pitches = Array.from(pitches).filter(Boolean);
        }
    }

    add(step53) {
        return new PitchSet(this.pitches.map(p => p.add(step53)));
    }

    [Symbol.iterator]() {
        return this.pitches[Symbol.iterator]();
    }

    get(item) {
        return this.pitches[item];
    }

    get bitmasks() {
        return { mask12: this.bitmask(true), mask53: this.bitmask(false) };
    }

    bitmask(in_edo12 = false) {
        let msk = 0n;
        for (const n of this.pitches) {
            const val = in_edo12 ? BigInt(n.edo12) : BigInt(n.edo53);
            msk |= (1n << val);
        }
        return msk;
    }

    get white2alteration() {
        const dd = {};
        for (const n of this.pitches) {
            dd[n.white] = n.alt;
        }
        return dd;
    }
}
