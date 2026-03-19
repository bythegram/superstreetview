/**
 * Movement module — phone-tilt and auto-advance helpers.
 *
 * NOTE: The `tilt()` function currently fires on any positive β value, causing
 * rapid continuous movement.  Adding a dead-zone threshold is tracked in
 * ROADMAP.md under "Mobile tilt-to-move".
 */

import { state } from './state.js';

/**
 * Return the angular difference (0–180°) between the panorama's current
 * heading and a navigation link's heading.
 *
 * @param {{ heading: number }} link
 * @returns {number}
 */
export function difference(link) {
  let diff = Math.abs((state.panorama.pov.heading % 360) - link.heading);
  if (diff > 180) {
    diff = Math.abs(360 - diff);
  }
  return diff;
}

/**
 * Advance the panorama one step in the direction closest to the current
 * heading.
 *
 * @param {google.maps.StreetViewPanorama} pano
 */
export function moveForward(pano) {
  let curr;
  const links = pano.links;
  for (let i = 0; i < links.length; i++) {
    if (curr === undefined) {
      curr = links[i];
    }
    if (difference(curr) > difference(links[i])) {
      curr = links[i];
    }
  }
  pano.setPano(curr.pano);
}

/**
 * Trigger `moveForward` when the device tilts forward (positive β).
 *
 * @param {number} x  Device β (tilt) value from a DeviceOrientationEvent.
 */
export function tilt(x) {
  if (x > 0) {
    moveForward(state.panorama);
  }
}

/** Register device-orientation / device-motion listeners. */
export function registerTiltListener() {
  const handler = (eventData) => tilt(eventData.beta);

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handler, true);
  } else if (window.DeviceMotionEvent) {
    window.addEventListener('deviceorientation', handler, true);
  }
}
