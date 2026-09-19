# Jagriti Mattress — storefront

A static, multi-page marketing storefront for Jagriti Mattress Pvt. Ltd. (Lalitpur, Nepal).
Plain HTML5 + CSS + vanilla JS on top of Bootstrap 5 (CDN). No build step, no framework.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Home — hero, stats bar, mattress rail, quilts & pillows rail, CTA, craftsmanship split, orange story band, quote, journal teaser, "Want to be a dealer?" section + popup |
| `shop.html` | Shop/listing — search, build + use filter pills, comfort dropdown, all 23 product cards, pagination, closing CTA |
| `our-difference.html` | How a mattress is built: pillars, testing, six layers, build comparison table |
| `our-story.html` | 2003 to today — timeline, founder quote, values |
| `visit-us.html` | Showroom + factory outlet details, what to expect, contact form |
| `dealership.html` | Why deal with us, the dealership application form, dealer FAQ |
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
| `assets/products/` | Watermarked product images, one per `slug` |
| `assets/originals/` | Clean, unwatermarked copies of every product image |
| `logo.png` | Original brand lockup (source for `assets/logo-mark.png`) |

Fourteen pages in total. The header and footer are duplicated in each one by design
(static site, no templating) — edit them everywhere when they change.

## Running it

Any static server works, e.g.:

```
python -m http.server 8000
```

then open <http://127.0.0.1:8000/index.html>. Opening the files directly with `file://`
works too — everything is relative.

## Products

`23` pieces, defined once and rendered into `shop.html` and both home page rails.

| Product | Build | `data-category` | `data-use` | Image |
| --- | --- | --- | --- | --- |
| Core Plus Mattress | Bonnell spring | spring | home hostel | photo |
| Core Plus Hotel | Bonnell spring | spring | hotel | scene |
| Royal Mattress | Pocketed spring | spring | home personal | scene |
| Royal Hotel Suite | Pocketed spring | spring | hotel | scene |
| Royal Dual Comfort | Pocketed spring | spring | home personal | scene |
| Royal Latex Top | Pocketed spring + latex | spring | home personal | scene |
| EcoFeel Mattress | Natural coir | coir | home kids | photo |
| Revive Mattress | Natural coir | coir | home | scene |
| Revive Euro Top Mattress | Natural coir | coir | home personal | scene |
| EcoFeel Junior | Natural coir | coir | kids home | scene |
| Coir Guest Mattress | Natural coir | coir | hostel hotel | scene |
| Baby Cot Mattress | Natural coir | coir | kids | scene |
| Ortho Bliss Mattress | Rebonded foam | rebonded | personal home | scene |
| Rebond Hostel Mattress | Rebonded foam | rebonded | hostel hotel | scene |
| Rebond Bunk Mattress | Rebonded foam | rebonded | kids hostel | scene |
| Memory Cloud Mattress | Memory foam | foam | personal home | scene |
| Latex Natural Mattress | Natural latex | foam | personal home | scene |
| Ortho Foam Firm | High-density foam | foam | personal hostel | scene |
| Hotel Mattress Topper | Foam topper | foam | hotel home | scene |
| Jagriti Quilt | Quilt | bedding | home hotel | photo |
| Quilt Cover Set | Quilt cover | bedding | home hotel | photo |
| Fibre Pillow | Pillow | bedding | home hotel | photo |
| Memory Foam Pillow | Pillow | bedding | home personal | photo |

**No prices are shown anywhere.** The cards read "Made to order", the order form says the
price is confirmed on WhatsApp, and the order message ends with "Please confirm the price
and delivery time."

### Filtering

`shop.html` filters on three independent dimensions, all handled in `main.js`:

* **Made of** &mdash; `data-category` (`coir` | `rebonded` | `spring` | `foam` | `bedding`),
  driven by the `[data-filter]` pills.
* **Used for** &mdash; `data-use`, driven by the `[data-filter-use]` pills. This one holds a
  **space-separated list** (`data-use="home hotel"`), so a piece can be sold into more than one
  setting and shows up under each. Values: `home`, `hotel`, `personal`, `kids`, `hostel`.
* **Comfort** &mdash; `data-comfort` (`soft` | `medium` | `firm` | `extra-firm`), the dropdown.

Search matches all visible card text plus the top finishes. The URL presets are
`shop.html?category=…`, `shop.html?use=…` and `shop.html?q=…`. `PAGE_SIZE` (12) drives the
pagination.

### Top finishes

**Every mattress is offered Normal, Pillow top and Euro top.** That is one attribute on the
card button, `data-variants="Normal|Pillow top|Euro top"`, written by `catalogue` for every
product that does not set `tops=False`. `main.js` fills the **Top finish** select in the order
modal from it, hides the field for anything without it, and adds a `Top finish:` line to the
WhatsApp order. The card shows the same three under the tag row (`.top-row`).

Two pieces deliberately opt out with `tops=False`: the **Hotel Mattress Topper** (it *is* a
top) and the **Baby Cot Mattress** (a soft top on an infant sleep surface is a safety
question, not a style one). Change either in the catalogue if you disagree. The four bedding
pieces have no finishes either.

`Revive Euro Top` stays a separate product because it is sold as its own line, not because the
euro top is otherwise unavailable.

* To add a product, add a dict to `MATTRESSES` or `BEDDING` and regenerate, or copy an existing
  `<div class="col" data-product …>` block and edit it by hand &mdash; the markup is plain HTML
  either way.
* Both home page sections are **rails** (`.product-rail`): four cards to a row, the rest scrolls
  sideways, two across on tablet and one plus a peek on a phone. The arrows move one card at a
  time and grey out at the ends; `main.js` hides them and centres the row when nothing
  overflows. `FEATURED` in the catalogue picks which mattresses appear on the home rail.

## Ordering

There is no checkout. The circular **+** on a product card opens the order form modal
(`#orderModal`, markup at the bottom of `index.html` and `shop.html`), pre-filled with that
mattress and its photo. On submit `main.js` builds a plain-text order and opens
WhatsApp with it — the customer presses send, and the order arrives as a message:

```
Product: Core Plus Mattress
Top finish: Euro top          ← only for products with data-variants
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

Dealership applications are handled like the order form rather than like those:
`main.js` binds **every** `[data-dealer-form]`, validates it, builds a plain-text application
and opens WhatsApp with it. There are two on the site and they share that one handler:

* the **popup** on the home page (`#dealerModal`), opened from three places — the
  **Become a dealer** button in the hero, and either button in the "Want to be a dealer?"
  section (`#dealer`); and
* the inline form on `dealership.html`.

Both ask the same five things &mdash; name, contact number, address, business start date, and
whether the business is wholesale or retail &mdash; plus an optional notes box.

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

**These are licensed stock photographs (Pexels), not AI-generated images, and not your
products.** Two images *are* real Jagriti products: `assets/core-plus-1.jpeg` and
`assets/ecofeel.jpeg`.

Every mattress photo was chosen for one reason: the mattress is **uncovered**. A made bed
with a duvet on it has no product surface, and nothing to brand.

### The logo is printed onto the mattress

It is not an overlay sitting on top of the picture. For each photo the four corners of the
mattress top face were read off a grid, and the lockup is warped into that plane with a
perspective transform, then blended so the quilting, folds and shading of the cloth come
through it. It reads as a logo woven into the panel, and it tilts and foreshortens with the
mattress exactly as a real one would.

That lives in two scratch scripts rather than the site itself — the site only ever sees the
finished JPEGs. The per-photo surface quads and logo placement (`w`, `cx`, `cy`) are the only
things worth re-tuning if you replace a photo.

Soft goods are treated differently on purpose: the quilt, quilt cover and two pillows get a
small corner lockup, because nobody prints a metre-wide logo on a duvet. `assets/ecofeel.jpeg`
is left alone entirely — that mattress already carries Jagriti branding on its wrap.

### Originals

Clean, unbranded copies of every photo are kept in `assets/originals/`. Nothing is destroyed,
so the logo can be resized, moved, restyled or removed by rebuilding from those.

### Replacing them

`.product-media img` crops to **16:10** and every file is 1440 x 900, so match that. Drop a new
file over `assets/products/<slug>.jpg` and the card picks it up — no markup change. If you
have real product photography, or generate images elsewhere, that is the only step needed.
