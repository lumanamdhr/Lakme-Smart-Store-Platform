def get_effective_price(product):
    """Returns what the customer should actually pay for one unit —
    the discounted price if the product is on sale, otherwise the normal price."""
    if product.on_sale and product.discount_percent > 0:
        return round(product.price * (1 - product.discount_percent / 100), 2)
    return product.price