"""
generate_sales.py
Creates realistic-looking fake sales so the recommendation system
has co-purchase data to learn from. Run this once; re-run any time
you want more data (it only ADDS sales, never deletes).
"""

import random
from datetime import datetime, timedelta

from database import SessionLocal
from models import Product, Customer, Sale, SaleItem
from security import hash_password

# ---------------------------------------------------------------
# RULE: if someone just bought from category X, which category is
# their NEXT item likely to come from? Repeating a name in the list
# makes it more likely to be picked — it's a simple weighting trick.
# ---------------------------------------------------------------
CATEGORY_AFFINITY = {
    "Lips":     ["Lips", "Lips", "Lips", "Face"],
    "Face":     ["Face", "Face", "Lips", "Eyes"],
    "Eyes":     ["Eyes", "Eyes", "Eyes", "Face"],
    "Skincare": ["Skincare", "Skincare", "Skincare", "Face"],
}

NUM_SALES = 200           # how many fake sales to create
MIN_FAKE_CUSTOMERS = 15   # top up to at least this many customer accounts


def get_or_create_customers(db):
    customers = db.query(Customer).filter(Customer.role == "customer").all()
    needed = MIN_FAKE_CUSTOMERS - len(customers)

    for i in range(needed):
        db.add(Customer(
            name=f"Demo Customer {i + 1}",
            email=f"demo{i + 1}@example.com",
            password=hash_password("demo12345"),
            role="customer",
        ))

    if needed > 0:
        db.commit()
        customers = db.query(Customer).filter(Customer.role == "customer").all()

    return customers

#pick_basket build one shopping basket: starts with one random product then keeps on adding items
def pick_basket(products_by_category, all_products):
    # 20% chance of buying just 1 item, 50% chance of 2, 20% of 3, 10% of 4
    basket_size = random.choices([1, 2, 3, 4], weights=[20, 50, 20, 10], k=1)[0]

    first_product = random.choice(all_products)
    basket = [first_product]

    while len(basket) < basket_size:
        current_category = basket[-1].category
        next_category = random.choice(
            CATEGORY_AFFINITY.get(current_category, [current_category])
        )

        already_picked_ids = [p.id for p in basket]
        candidates = [
            p for p in products_by_category.get(next_category, [])
            if p.id not in already_picked_ids
        ]

        if not candidates:
            break  # nothing left to add from that category

        basket.append(random.choice(candidates))

    return basket


def generate_sales(db):
    products = db.query(Product).all()
    if not products:
        print("No products found — add products first.")
        return

    products_by_category = {}
    for p in products:
        products_by_category.setdefault(p.category, []).append(p)

    customers = get_or_create_customers(db)

    for _ in range(NUM_SALES):
        customer = random.choice(customers)
        basket = pick_basket(products_by_category, products)

        sale_date = datetime.utcnow() - timedelta(days=random.randint(0, 90))

        sale = Sale(
            customer_id=customer.id,
            total_amount=0,  # we'll fill this in once we know the items
            payment_method=random.choice(["cash", "esewa", "khalti"]),
            status="completed",
            created_at=sale_date,
        )
        db.add(sale)
        db.flush()  # sends this INSERT so `sale.id` exists, without fully committing yet

        total = 0
        for product in basket:
            quantity = random.choices([1, 2], weights=[80, 20], k=1)[0]
            subtotal = product.price * quantity

            db.add(SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                price=product.price,
                subtotal=subtotal,
            ))
            total += subtotal

        sale.total_amount = total

    db.commit()
    print(f"Created {NUM_SALES} fake sales.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        generate_sales(db)
    finally:
        db.close()