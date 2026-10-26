# Crafts Titli

Custom Shopify storefront theme for Crafts Titli, featuring handmade accessories and an interactive studio for designing phone straps and bag clips. The theme metadata identifies it as **Crafts Titli Custom**, version **1.0.0**.

## Features

- Homepage with product collections, featured products, reviews, a community gallery, FAQs, and newsletter signup.
- Product, collection, cart, and Our Story page templates.
- Customizer with phone strap, multi-strand bag clip, and single-strand bag clip designs.
- Live design previews, personalized name beads, color choices, charm browsing, and arrangement controls.
- AJAX cart drawer with custom-design bundles and add-on items.
- Responsive layouts and mobile customizer controls.

## Technology

The storefront uses Shopify Liquid, CSS, and vanilla JavaScript. Shopify supplies product data, page rendering, cart APIs, and checkout. There is no project package manifest, application build step, or automated test suite in this repository.

Liquid templates require a Shopify store to render; opening them directly in a browser or running a generic static server will not run the storefront.

## Project structure

```text
assets/                         Shared styles, JavaScript, and logo
config/                         Theme settings schema and saved settings
layout/theme.liquid             Global page shell, header, footer, and cart drawer
locales/                        Translation strings
sections/                       Storefront sections and customizer implementation
snippets/                       Reusable Liquid fragments and cart drawer
templates/                      Page, product, collection, cart, and home templates
customizer-launch-video.html     Standalone launch presentation
```

The local `launch-video/` directory is ignored by Git and is not required to run the Shopify theme.

## Development setup

You need access to a Shopify store with permission to work on themes, and an installed [Shopify CLI](https://shopify.dev/docs/storefronts/themes/tools/cli). Follow the linked documentation for current installation requirements.

From the repository root, replace `your-store.myshopify.com` with your store domain and start a development preview:

```sh
shopify theme dev --store your-store.myshopify.com
```

Complete the CLI authentication prompts and open the preview URL it returns. Shopify CLI uploads the theme to the store for preview and reflects local changes during development. See the [theme dev reference](https://shopify.dev/docs/api/shopify-cli/theme/theme-dev).

## Store configuration

### Pages and navigation

Create Shopify pages with the following handles and assign the corresponding theme templates:

| Page handle | Template | Storefront URL |
| --- | --- | --- |
| `design-custom-piece` | `page.customizer.liquid` | `/pages/design-custom-piece` |
| `our-story` | `page.our-story.liquid` | `/pages/our-story` |

The header links to these URLs directly. If you choose different handles, update the matching links throughout the theme. Product and collection records must also be created in Shopify; they are not included with the source code.

### Customizer products

The active studio is implemented in `sections/build-your-own-phone-charm.liquid`, which is included by `templates/page.customizer.liquid`.

1. Create the base products and variants for phone straps, multi-strand bag clips, and single-strand bag clips in Shopify.
2. Replace the store-specific variant IDs on `#titliCustomizerApp`:
   - `data-phone-variant`
   - `data-bag-variant`
   - `data-bag-single-variant`
3. Populate the `customizer-charms` collection with purchasable charm products. The initial Liquid collection lookup falls back to `charms`.
4. Check product images, titles, tags, prices, availability, and selected variants against the customizer catalog and filters.
5. Review the base-price constants and any add-on price logic in the section. The interface contains hardcoded rupee amounts; its estimated totals must agree with the actual Shopify variant prices.

The section includes sample charm entries with `seed-` IDs. These are preview data, not purchasable Shopify variants. Verify that real catalog items load before using the customizer for orders.

Custom designs are submitted to `/cart/add.js`. A base item and eligible charm add-ons share a `_bundle_id`; add-ons are marked `_bundle_child`. Personalization is stored in line-item properties. Keep this contract aligned with `snippets/cart-drawer.liquid` when changing the customizer or cart display.

### Content and styling

- Edit homepage section order in `templates/index.liquid`.
- Edit global layout and shared script loading in `layout/theme.liquid`.
- Edit shared styling in `assets/theme.css` and `assets/customizer.css`.
- Review the inline CSS and JavaScript in `sections/build-your-own-phone-charm.liquid` when changing the current studio. It contains substantial implementation logic beyond the shared assets.
- Review `assets/customizer.js` before editing shared behavior; it also contains code for other customizer markup, including `#charm-builder-app`.
- Review `config/settings_schema.json` and `config/settings_data.json` for theme settings. Some colors and content are hardcoded in section files.
- The layout includes Judge.me-specific styling and DOM cleanup. Review this integration when configuring review widgets on another store.
- The cart drawer uses `bag-charms` for upsells, with a fallback to all products.
- The default homepage catalog links use `bag-charms`, `phone-charms`, `sun-catcher`, and `bookmarks`. Create these collections or configure the catalog section blocks to use your store's collections.
- Newsletter copy promises a 10% discount by email. Configure the discount and welcome email automation separately in Shopify, or update the copy; the theme's signup form alone does not send that offer.

## Validation

Run Shopify's static theme checks from the repository root:

```sh
shopify theme check
```

This invokes [Theme Check](https://shopify.dev/docs/api/shopify-cli/theme), which checks Liquid and theme code. It does not replace testing against a configured store.

Before publishing, preview the theme on desktop and mobile and verify:

- Homepage, collection, product, Our Story, and customizer links resolve.
- All three customizer models display correctly and update their previews and estimates.
- Name, color, charm selection, removal, reset, and arrangement controls work.
- Real charm products load and unavailable products are handled as expected.
- Adding a design creates the expected base item, add-ons, and personalization properties.
- Cart quantities, removals, bundle display, and checkout totals remain consistent.

## Upload for review

Upload a new unpublished theme for review:

```sh
shopify theme push --store your-store.myshopify.com --unpublished
```

Review it in Shopify before publishing. This workflow is documented in Shopify's [theme customization guide](https://shopify.dev/docs/storefronts/themes/getting-started/customize).

To generate a theme ZIP for manual upload:

```sh
shopify theme package
```

The [theme command reference](https://shopify.dev/docs/api/shopify-cli/theme) describes packaging and other theme management commands. Review store-specific settings before uploading to a different store.

## Launch presentation

Open `customizer-launch-video.html` in a browser to view the standalone launch presentation. This HTML file is separate from the Shopify storefront and is not a rendered Liquid page or a replacement for testing cart behavior on Shopify.
