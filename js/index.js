import { Pitch } from './pitch.js';
import { Sequence } from './sequence.js';
import { Cadence } from './cadence.js';
import { Scale } from './scale.js';

Pitch.populate();
Sequence.populate();
Cadence.populate();
Scale.populate();

console.log("Music theory modules successfully initialized.");
