# Jagriti Mattress — storefront

A static, multi-page marketing storefront for Jagriti Mattress Pvt. Ltd. (Lalitpur, Nepal).
Plain HTML5 + CSS + vanilla JS on top of Bootstrap 5 (CDN). No build step, no framework.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Home — hero, stats bar, featured products, CTA, craftsmanship split, orange story band, quote, journal teaser |
| `shop.html` | Shop/listing — search bar, the two product cards, closing CTA |
| `our-difference.html` | How a mattress is built: pillars, testing, six layers, range comparison table |
| `our-story.html` | 2003 to today — timeline, founder quote, values |
| `visit-us.html` | Showroom + factory outlet details, what to expect, contact form |
| `journal.html` | Journal index and sign-up strip |
| `journal-how-firm.html` | Article — How firm is firm enough? |
| `journal-rotate-air-repeat.html` | Article — Rotate, air, repeat |
| `journal-bedroom-that-ends-the-day.html` | Article — A bedroom that ends the day |
| `delivery.html` | Delivery steps, coverage table, what is included, FAQ |
| `warranty.html` | Cover by range, covered / not covered, how to claim, FAQ |
| `mattress-care.html` | Four habits, monsoon note, do / do not, year calendar |
| `track-order.html` | Order lookup form, four-stage status panel, FAQ |
| `styles.css` | Palette (CSS variables), type scale and every custom component class |
| `main.js` | Bag counter + toast, demo forms, and the shop filter / search / pagination logic |
| `assets/` | Logo crops, favicon and photography |
| `logo.png` | Original brand lockup (source for `assets/logo-mark.png`) |

Thirteen pages in total. The header and footer are duplicated in each one by design
(static site, no templating) — edit them everywhere when they change.

## Running it

Any static server works, e.g.:

```
python -m http.server 8000
```

then open <http://127.0.0.1:8000/index.html>. Opening the files directly with `file://`
works too — everything is relative.

## Products

Two mattresses are live, with the same card markup on `index.html` (featured section, beside
the heading) and `shop.html` (four-up grid, so more products fill the row later):

| Product | Build | Photo |
| --- | --- | --- |
| Core Plus Mattress | Tempered bonnell spring | `assets/core-plus-1.jpeg` |
| EcoFeel Mattress | Layered natural coir | `assets/ecofeel.jpeg` |

**No prices are shown anywhere.** The cards read "Made to order — Any size", the order form
says the price is confirmed on WhatsApp, and the order message ends with "Please confirm the
price and delivery time." Sizes, heights and warranty years in the comparison table on
`our-difference.html` and the cover cards on `warranty.html` are still placeholders — check
them before launch.

* `assets/core-plus-2.jpeg` is kept but unused (one photo per card for now). `main.js` and
  `styles.css` still support a `.product-thumbs` strip: give a card thumbs with
  `data-gallery-src` and mark the main image `data-gallery-main` to bring the gallery back.
* To add a product, duplicate a `<div class="col" data-product …>` block and edit the copy.
  The wrapper attributes drive filtering: `data-category` (`everyday` | `premium` |
  `signature`), `data-comfort` (`soft` | `medium` | `firm` | `extra-firm`) and `data-name`.
  Search matches all visible text in the card.
* The range pills, comfort dropdown and pagination were removed from `shop.html` while there
  are only two products — `main.js` still supports them, so restoring that markup (see git
  history) brings the behaviour back. `PAGE_SIZE` (currently 8) sets the page size, and the
  shop still accepts `shop.html?category=…` and `shop.html?q=…` presets.

## Ordering

There is no checkout. The circular **+** on a product card opens the order form modal
(`#orderModal`, markup at the bottom of `index.html` and `shop.html`), pre-filled with that
mattress and its photo. On submit `main.js` builds a plain-text order and opens
WhatsApp with it — the customer presses send, and the order arrives as a message:

```
Mattress: Core Plus Mattress
Size: Queen — 60 x 78 in
Quantity: 1
Name / Phone / City / Address / Notes

Please confirm the price and delivery time.
```

The number lives in one place, `WHATSAPP_NUMBER` at the top of the order block in `main.js`
(currently `9779744464491`). Sizes, fine print and field labels are plain HTML inside the
modal. To take orders on a server instead, give the form an `action` and drop the submit
handler.

A floating WhatsApp chat button sits on every page (`.whatsapp-fab`, just above the toast
markup) and links to the same number.

## Contact details

Address, phone and email appear in the footer of all 13 pages, on `visit-us.html`, and on
`track-order.html`:

* Sankharapur-9, Indrayani, Kathmandu
* +977-9744464491 (phone and WhatsApp)
* jagritimattress@gmail.com

## Forms

`visit-us.html`, `journal.html` and `track-order.html` carry front-end-only forms. Each is
marked `data-demo-form` and handled in `main.js`: it blocks the submit, shows the message in
its `data-success` attribute, and — on the order lookup — reveals the panel named by
`data-reveal`. Point them at a real endpoint by removing `data-demo-form` and adding
`action` / `method`.

## Theme

The palette is defined once in `:root` in `styles.css`:

```css
--jagriti-navy:   #0F2A3F;   /* headlines, dark sections, footer   */
--jagriti-orange: #E8722C;   /* accents, CTAs, active nav underline */
--jagriti-mint:   #E8F0EC;   /* hero and alternating sections       */
--jagriti-cream:  #F7F5EF;   /* base page background                */
```

Utility classes `.bg-navy`, `.bg-accent`, `.bg-mint`, `.bg-cream` and the card tints
`.tint-mint`, `.tint-blue`, `.tint-tan`, `.tint-cream` layer on top of Bootstrap rather
than overriding its Sass variables.

## Photography

Product and hero images in `assets/` are Unsplash photographs used as placeholders.
Swap them for real product shots before launch — the cards expect a 4:3 crop.
