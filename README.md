# Eun my Wife 💌

A little story site that ends with one very important question.

Plain HTML/CSS/JS, no build step. Open `index.html`, or host it with GitHub Pages
(Settings → Pages → deploy from branch → `/root`).

## Adding photos

Drop pictures into `images/` using these names (up to 8 per slot, swipeable):

| Page | File names |
| --- | --- |
| Aquarium (date 1) | `aquarium-1.jpg`, `aquarium-2.jpg`, ... |
| Bowling (date 2) | `bowling-1.jpg`, ... |
| Baking (date 3) | `baking-1.jpg`, ... |
| Painting (date 4) | `painting-1.jpg`, ... |
| After she says yes | `us-1.jpg`, ... |

`.jpg`, `.jpeg`, `.png` and `.webp` work (not iPhone `.heic`). Short clips work too:
add e.g. `bowling-1.mp4` plus an optional `bowling-1.poster.jpg` still (not `.mov`). Any slot without a
photo shows a cute placeholder polaroid instead.

## Music

- `music/story.mp3` plays (looped) from the moment she opens the envelope until she taps Yes.
  It is an original synthesised piano loop; replace the file with any mp3 to change it.
- The ♫ button in the top-right corner turns the music on and off.

## The last page

- Favourite photos that pop in: `images/fav-1.jpg` ... `fav-6.jpg`.
- Song: the official YouTube video is embedded and started when she taps Yes (some phones
  need one extra tap on the player). For guaranteed autoplay, add your own copy of the
  song as `music/passenger-seat.mp3`; it is used instead of YouTube when present.

## Editing the words

All the text lives in `index.html`. The No button's teasing lines are the `TAUNTS`
list in `script.js`.
