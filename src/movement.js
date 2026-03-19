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
  const pov = state.panorama.getPov();
  let diff = Math.abs((pov.heading % 360) - link.heading);
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
  const links = pano.links;
  if (!links || links.length === 0) {
    return;
  }
  let curr;
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

/** Register a device-orientation listener for tilt-to-move. */
export function registerTiltListener() {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (eventData) => tilt(eventData.beta), true);
  }
}
