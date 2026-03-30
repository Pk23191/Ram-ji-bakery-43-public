function getRecommendations(products, orders = [], behaviorTags = []) {
  const aggregatedTags = [
    ...behaviorTags,
    ...orders.flatMap((order) => order.behaviorTags || []),
    ...orders.flatMap((order) => order.items.map((item) => item.category.toLowerCase()))
  ].map((item) => item.toLowerCase());

  if (!aggregatedTags.length) {
    return products.slice(0, 3);
  }

  return products
    .map((product) => {
      const flavors = (product.flavors || []).map((item) => item.toLowerCase());
      const score = aggregatedTags.reduce((sum, tag) => {
        if (product.category.toLowerCase().includes(tag)) return sum + 2;
        if (flavors.some((flavor) => flavor.includes(tag))) return sum + 3;
        if (product.name.toLowerCase().includes(tag)) return sum + 1;
        return sum;
      }, 0);

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.product);
}

module.exports = { getRecommendations };
