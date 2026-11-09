/**
 * The homepage scroll story is ONE scrubbed GSAP timeline, measured in "beats":
 *
 *   0 – 1     hero          assembled burger, BURGER lettering, ingredients, Order Now
 *   1 – 3     explode       parts travel from assembled_z to exploded_z (top bun first)
 *   3 – 7     showcase      camera frames beef, cheddar, vegetables, brioche
 *   7 – 8.6   reassemble    the same parts return to assembled_z
 *   8.6 – END land in All   the same burger shrinks and flies into the "All" cuisine tile
 *
 * The scroll trigger runs from the top of the story track to the cuisine section's top
 * reaching LANDING_END of the viewport. The beats before HANDOFF_AT play over the track
 * (TRACK_SCREENS × 100vh, i.e. TRACK_SCREENS - 1 screens of scrolling) and the landing plays
 * exactly while the cuisine section scrolls in, so the tile is on screen when the burger lands.
 * Both lengths are in viewport heights, so this ratio holds on every screen size.
 */
export const TRACK_SCREENS = 6
export const LANDING_END = 0.28 // cuisine section top at 28 % of the viewport = burger has landed
export const HANDOFF_AT = 8.6
export const LANDING_BEATS = (HANDOFF_AT * (1 - LANDING_END)) / (TRACK_SCREENS - 1)
export const STORY_END = HANDOFF_AT + LANDING_BEATS
