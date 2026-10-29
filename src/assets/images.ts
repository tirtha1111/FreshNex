// Local visual assets for FreshNex platform (no external banned Unsplash URLs)

const heroCrate = new URL('./images/freshnex_hero_crate_1789921168287.jpg', import.meta.url).href;
const crateSquare = new URL('./images/freshnex_crate_square_1789921186011.jpg', import.meta.url).href;
const tomatoProduct = new URL('./images/freshnex_tomato_card_1789921202123.jpg', import.meta.url).href;
const farmLandscape = new URL('./images/freshnex_farm_landscape_1789921215887.jpg', import.meta.url).href;
const logoEmblem = new URL('./images/freshnex_logo_emblem_1790061300230.jpg', import.meta.url).href;

export const ASSETS = {
  logoEmblem,
  heroCrate,
  crateSquare,
  tomatoProduct,
  farmLandscape,
  mixedVegetables: crateSquare,
  lettuce: heroCrate,
  colddrinks: '/colddrinks.jpg',
  ketchup: '/colddrinks.jpg',
  milk: '/colddrinks.jpg',
  chicken: tomatoProduct,
  fish: crateSquare,
};
