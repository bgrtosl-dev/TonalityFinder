import { Pitch } from './pitch.js';

export const MAJ = 'maj';
export const MIN = 'min';
export const MIN_MLD = 'min_mld';
export const MIN_HRM = 'min_hrm';

export class PitchSet {
    constructor(pitches) {
        if (typeof pitches === 'string') {
            this.pitches = Pitch.as_note_nt(pitches, true);
        } else {
            this.pitches = Array.from(pitches);
        }
    }

    [Symbol.iterator]() {
        return iter(this.pitches);
    }

    at(index) {
        return this.pitches[index];
    }

    get length() {
        return this.pitches.length;
    }

    bitmask(inEdo12 = false) {
        let msk = 0n;
        for (const n of this.pitches) {
            const val = inEdo12 ? BigInt(n.edo12) : BigInt(n.edo53);
            msk |= (1n << val);
        }
        return msk;
    }

    get bitmasks() {
        return {
            mask12: this.bitmask(true),
            mask53: this.bitmask(false)
        };
    }

    get white2alteration() {
        const dd = {};
        for (const n of this.pitches) {
            dd[n.white] = n.alt;
        }
        return dd;
    }
}

function* iter(arr) {
    yield* arr;
}

export class Scale {
    static scales = [];

    constructor({ name, symb, key_sig, pitches }) {
        this.name = name;
        this.symb = symb;
        this.key_sig = key_sig;
        this.pitches = new PitchSet(pitches);
        this.mask12 = this.pitches.bitmask(true);
        this.mask53 = this.pitches.bitmask(false);

        if (this.key_sig < 0) {
            this.enh_pitches = new PitchSet(this.pitches.pitches.map(n => n.as_enh_flat));
        } else {
            this.enh_pitches = new PitchSet(this.pitches.pitches.map(n => n.as_enh_sharp));
        }
    }

    toString() {
        const tonicEng = this.pitches.at(0).eng;
        return `${tonicEng} ${this.name}`;
    }

    get white2alteration() {
        return this.pitches.white2alteration;
    }

    get is_major() {
        return this.symb === MAJ;
    }

    get tonic() {
        return this.pitches.at(0);
    }

    get notes_str() {
        return this.pitches.pitches.map(n => n.eng).join(' ');
    }

    get enh_str() {
        return this.enh_pitches.pitches.map(n => n.eng).join(' ');
    }

    static key2scales(keySig) {
        const slct = {};
        for (const scl of Scale.scales) {
            if (scl.key_sig === keySig) {
                slct[scl.symb] = scl;
            }
        }
        return [slct[MAJ], slct[MIN_MLD], slct[MIN_HRM]];
    }

    static key2maj(keySig) {
        const [maj] = Scale.key2scales(keySig);
        return maj;
    }

    static find(txt, inEdo12 = false) {
        const notes = new PitchSet(txt);
        const bitmask = notes.bitmask(inEdo12);
        if (inEdo12) {
            return Scale.scales.filter(scl => (bitmask & scl.mask12) === bitmask);
        } else {
            return Scale.scales.filter(scl => (bitmask & scl.mask53) === bitmask);
        }
    }

    static populate() {
        const majPitches = Pitch.as_note_nt('C D E F G A B', true);
        const majTnc = majPitches[0];
        const minHrmPitches = Pitch.as_note_nt('A B C D E F G#', true);
        const minMldPitches = Pitch.as_note_nt('A B C D E F# G#', true);

        for (const tonic of Pitch.pitches) {
            const d53 = tonic.edo53 - majTnc.edo53;
            try {
                const scl = majPitches.map(n => n.add(d53));
                const keySig = scl.reduce((acc, n) => acc + n.altrn, 0);
                if (Math.abs(keySig) > 7) continue;

                Scale.scales.push(new Scale({ name: 'Major', symb: MAJ, key_sig: keySig, pitches: scl }));

                for (const [mdl, sym, name] of [[minMldPitches, MIN_MLD, 'Minor Melodic'],
                                               [minHrmPitches, MIN_HRM, 'Minor Harmonic']]) {
                    try {
                        const sclMdl = mdl.map(n => n.add(d53));
                        Scale.scales.push(new Scale({ name: name, symb: sym, key_sig: keySig, pitches: sclMdl }));
                    } catch (e) {
                        // Skip if pitch transposition fails
                    }
                }
            } catch (e) {
                // Skip
            }
        }
    }
}
