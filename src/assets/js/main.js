import "../css/style.css";

const CONFIG = {
  API_URL: "https://tsodykteststore.myshopify.com/api/2023-01/graphql.json",
  ACCESS_TOKEN: "7e174585a317d187255660745da44cc7",
};

const CLASS_NAMES = {
  CONTAINER: ".cards",
  CARD: "card",
  PHOTO_FRONT: "card__product-photo front",
  PHOTO_BACK: "card__product-photo back",
};

const DEFAULTS = {
  DESCRIPTION: "Опису товару немає",
  IMAGE: "placeholder.jpg",
  ALT_TEXT: "Product image",
};

const query = `
{
  products(first: 10) {
    edges {
      node {
        title
        description
        variants(first: 1) {
          edges {
            node {
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
            }
          }
        }
        images(first: 2) {
          edges {
            node { url altText }
          }
        }
      }
    }
  }
}`;

document.addEventListener("DOMContentLoaded", () => {
  fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": CONFIG.ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data.data?.products) throw new Error("No products found");
      const products = processProducts(data.data.products.edges);
      renderProducts(products);
    })
    .catch((error) => {
      console.error("Ошибка загрузки товаров:", error);
      const container = document.querySelector(CLASS_NAMES.CONTAINER);
      container.innerHTML = `<p>Не удалось загрузить товары: ${error.message}</p>`;
    });
});

function processProducts(edges) {
  return edges.map(({ node }) => {
    const { title, description, variants, images } = node;
    const variant = variants.edges[0]?.node ?? {};
    const imageNodes = images.edges;

    return {
      title,
      description: description || DEFAULTS.DESCRIPTION,
      price: variant.price?.amount ?? "N/A",
      currency: variant.price?.currencyCode ?? "",
      image1: imageNodes[0]?.node.url ?? DEFAULTS.IMAGE,
      image2:
        imageNodes[1]?.node.url ?? imageNodes[0]?.node.url ?? DEFAULTS.IMAGE,
      altText: imageNodes[0]?.node.altText ?? DEFAULTS.ALT_TEXT,
    };
  });
}

function createCard(product) {
  return `
    <div class="${CLASS_NAMES.CARD}">
      <div class="card__product">
        <img src="${product.image1}" alt="${product.altText}" class="${CLASS_NAMES.PHOTO_FRONT}" loading="lazy" />
        <img src="${product.image2}" alt="${product.altText}" class="${CLASS_NAMES.PHOTO_BACK}" loading="lazy" />
      </div>
      <div class="card__descr">
        <div class="card__desc-title">${product.title}</div>
        <div class="card__desc-subtitle">${product.description}</div>
        <div class="card__desc-price"><span>${product.price}</span> ${product.currency}</div>
      </div>
    </div>
  `;
}

function renderProducts(products) {
  const container = document.querySelector(CLASS_NAMES.CONTAINER);
  if (!container) return;
  container.innerHTML = products.map(createCard).join("");
}
