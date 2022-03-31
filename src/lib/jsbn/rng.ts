// Random number generator - requires a PRNG backend, e.g. prng4.js
import {Arcfour, prng_newstate, rng_psize} from "./prng4";

let rng_state:Arcfour;
let rng_pool:number[] = null;
let rng_pptr:number;
const hasWin: boolean = typeof window === 'object' && !!window;

// Initialize the pool with junk if needed.
if (rng_pool == null) {
  rng_pool = [];
  rng_pptr = 0;
  let t;
  if (hasWin && window.crypto && window.crypto.getRandomValues) {
    // Extract entropy (2048 bits) from RNG if available
    const z = new Uint32Array(256);
    window.crypto.getRandomValues(z);
    for (t = 0; t < z.length; ++t) {
        rng_pool[rng_pptr++] = z[t] & 255;
    }
  }

  // Use mouse events for entropy, if we do not have enough entropy by the time
  // we need it, entropy will be generated by Math.random.
  var count = 0;
  const onMouseMoveListener = function (ev:Event & {x:number; y:number; }) {
    count = count || 0;
    if (count >= 256 || rng_pptr >= rng_psize) {
      if (window.removeEventListener) {
          window.removeEventListener("mousemove", onMouseMoveListener, false);
      } else if ((window as any).detachEvent) {
          (window as any).detachEvent("onmousemove", onMouseMoveListener);
      }
      return;
    }
    try {
      const mouseCoordinates = ev.x + ev.y;
      rng_pool[rng_pptr++] = mouseCoordinates & 255;
      count += 1;
    } catch (e) {
      // Sometimes Firefox will deny permission to access event properties for some reason. Ignore.
    }
  };
  if (hasWin && window.addEventListener) {
      window.addEventListener("mousemove", onMouseMoveListener, false);
  } else if (hasWin && (window as any).attachEvent) {
      (window as any).attachEvent("onmousemove", onMouseMoveListener);
  }

}

function rng_get_byte() {
  if (rng_state == null) {
    rng_state = prng_newstate();
    // At this point, we may not have collected enough entropy.  If not, fall back to Math.random
    while (rng_pptr < rng_psize) {
      const random = Math.floor(65536 * Math.random());
      rng_pool[rng_pptr++] = random & 255;
    }
    rng_state.init(rng_pool);
    for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr) {
        rng_pool[rng_pptr] = 0;
    }
    rng_pptr = 0;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}


export class SecureRandom {

  public nextBytes(ba:number[]) {
      for (let i = 0; i < ba.length; ++i) {
          ba[i] = rng_get_byte();
      }
  }
}
