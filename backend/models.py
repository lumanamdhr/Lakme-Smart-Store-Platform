from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Date, Boolean
from database import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=10)
    # Stores the path of the product image
    image = Column(String(255), nullable=True)
    on_sale = Column(Boolean, default=False)
    discount_percent = Column(Integer, default=0)
class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )

class CartItem(Base): #bridge between cart and product
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)

    cart_id = Column(
        Integer,
        ForeignKey("carts.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1
    )
class Customer(Base): #creates database model called customer
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(
    String(20),
    nullable=False,
    default="customer"
    )
    age = Column(
    Integer,
    nullable=True
    )

    gender = Column(
        String(20),
        nullable=True
    )

    location = Column(
        String(100),
        nullable=True
    )
    date_of_birth = Column(Date, nullable=True)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )

    total_amount = Column(
        Float,
        nullable=False
    )

    payment_method = Column(
        String(50),
        nullable=False,
        default="cash"
    )

    status = Column(
        String(50),
        nullable=False,
        default="completed"
    )

    created_at = Column( #automatically record sales when happens
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    subtotal = Column(
        Float,
        nullable=False
    )
