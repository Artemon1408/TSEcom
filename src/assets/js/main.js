import "../css/style.css";

const API_URL =
  "https://tsodykteststore.myshopify.com/api/2023-01/graphql.json";

const ACCESS_TOKEN = "7e174585a317d187255660745da44cc7";

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
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
        images(first: 2) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  }
}`;

document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  })
    .then((res) => res.json())
    .then((data) => {
      const products = data.data.products.edges.map(({ node }) => {
        const images = node.images.edges.map((img) => img.node.url);

        return {
          title: node.title,
          description: node.description || "Опису товару немає",
          price: node.variants.edges[0]?.node.price.amount ?? "N/A",
          currency: node.variants.edges[0]?.node.price.currencyCode ?? "",
          image1: images[0] || "placeholder.jpg",
          image2: images[1] || images[0] || "placeholder.jpg",
          altText: node.images.edges[0]?.node.altText ?? "Product image",
        };
      });

      renderProducts(products);
    })
    .catch((error) => console.error("Ошибка загрузки товаров:", error));
});

function renderProducts(products) {
  const container = document.querySelector(".cards");

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    const descriptionText = product.description
      ? product.description
      : "Опису товару немає";

    card.innerHTML = `
      <div class="card__product">
        <img src="${product.image1}" alt="${product.altText}" class="card__product-photo front" />
        <img src="${product.image2}" alt="${product.altText}" class="card__product-photo back" />
      </div>
      <div class="card__descr">
        <div class="card__desc-title">${product.title}</div>
        <div class="card__desc-subtitle">${descriptionText}</div>
        <div class="card__desc-price"><span>${product.price}</span> ${product.currency}</div>
      </div>
    `;

    container.appendChild(card);
  });
}
