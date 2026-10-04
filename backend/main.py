from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form #depends tell before running API, the other thing is needed first
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text, func, case #execute raw SQL text through sqlalchemy interface
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

import os
import uuid
from pathlib import Path

from pydantic import BaseModel
from jose import jwt
from datetime import date, timedelta

from pricing import get_effective_price
from chatbot import get_response
from recommender import get_recommendations
from database import engine, get_db ,Base #import engine and base we created in db.py
from models import Product,Customer, Cart, CartItem, Sale, SaleItem
from schemas import (
    ProductCreate, 
    ProductResponse, 
    ProductUpdate,
    CustomerCreate,
    CustomerResponse,
    CustomerLogin,
    CartItemCreate,
    CartItemResponse,
    CartResponse,
    CartItemUpdate,
    CheckoutRequest,
    SaleResponse,
    SaleStatusUpdate,
    CustomerDashboardResponse,
    IntelligenceProductResponse,
    AdminUserCreate,
    RestockRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChatRequest,
    ChatResponse,
    )
from security import (
    hash_password, 
    verify_password, 
    create_access_token,
    get_current_user,
    require_role,
    SECRET_KEY,
    ALGORITHM
)

def calculate_age(date_of_birth: date) -> int:
    today = date.today()

    age = today.year - date_of_birth.year

    if (
        (today.month, today.day)
        < (date_of_birth.month, date_of_birth.day)
    ):
        age -= 1

    return age

app = FastAPI()

# Serve product images from backend/static/
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], #allow react frontend to communicate with API
    allow_credentials=True, #allows credentilas such as authentication inof when implement login
    allow_methods=["*"], #allows the HTTP methods as GET POST PUT DELETE
    allow_headers=["*"], #allows frontend to send HTTP headers
)
Base.metadata.create_all(bind=engine) #scans all the models that inherit from base and creates their database if they don't exist


@app.get("/")
def root():
    return {"message": "Customer Cnetric Inventory System API is running!"}

@app.get("/db-test") #creates another API endpoint that test FastAPI +PostgreSQL
def database_test():
    with engine.connect() as connection: #opens connection to postgre
        result = connection.execute(text("SELECT 1")) #simple database connection test
        return {
            "database": "connected",
            "result": result.scalar() #gets actual value ie 1
        }


@app.post("/products", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    category: str = Form(...),
    description: str | None = Form(None),
    price: float = Form(...),
    stock_quantity: int = Form(...),
    reorder_level: int = Form(10),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can add products."
        )

    image_path = None

    if image:
        upload_directory = Path("static/products")
        upload_directory.mkdir(parents=True, exist_ok=True)

        file_extension = Path(image.filename).suffix.lower()

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        }

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Only JPG, JPEG, PNG, and WEBP images are allowed."
            )

        unique_filename = f"{uuid.uuid4()}{file_extension}"

        file_location = upload_directory / unique_filename

        with open(file_location, "wb") as buffer:
            buffer.write(await image.read())

        image_path = f"/static/products/{unique_filename}"

    new_product = Product(
        name=name,
        category=category,
        description=description,
        price=price,
        stock_quantity=stock_quantity,
        reorder_level=reorder_level,
        image=image_path
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@app.get("/products", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):

    products = db.query(Product).all()

    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return product

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Only administrators and employees can edit products."
        )

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = product_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product

#restockupdate
@app.post("/products/{product_id}/restock", response_model=ProductResponse)
def restock_product(
    product_id: int,
    restock_data: RestockRequest,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):
    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Only administrators and employees can restock products."
        )

    if restock_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Restock quantity must be greater than zero."
        )

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.stock_quantity += restock_data.quantity

    db.commit()
    db.refresh(product)

    return product

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can delete products."
        )

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


@app.get("/products/{product_id}/recommendations", response_model=list[ProductResponse])
def recommend_products(product_id: int, db: Session = Depends(get_db)):
    return get_recommendations(db, product_id)

@app.post("/chatbot", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    return get_response(db, request.message)


#cart
@app.get("/cart/{customer_id}", response_model=CartResponse)
def get_cart(
    customer_id: int, #id comes from URL
    db: Session = Depends(get_db)
):
    cart = (
        db.query(Cart) #query to communicate with PostgreSQL through SQLALchemy
        .filter(Cart.customer_id == customer_id)
        .first()
    )

    if cart is None: #creates cart if cart doesnot exist
        cart = Cart(customer_id=customer_id)
        db.add(cart) #adds to SQLALchemy session
        db.commit() #saves it to PostgreSQL
        db.refresh(cart) #gets newly generated db id

    cart_items = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    items = []
    total = 0

    for cart_item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == cart_item.product_id) #cartitem and product connection happens
            .first()
        )

        if product is not None:

            unit_price = get_effective_price(product)
            subtotal = unit_price * cart_item.quantity
            total += subtotal

            items.append({ #adds product to our item list
                "id": cart_item.id,
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "price": unit_price,
                "quantity": cart_item.quantity,
                "subtotal": subtotal,
                "image": product.image
            })

    return { #backend gives react the entire cart
        "id": cart.id,
        "customer_id": cart.customer_id,
        "items": items,
        "total": total
    }

@app.post("/cart/{customer_id}/items", response_model=CartItemResponse)
def add_to_cart(
    customer_id: int,
    cart_item: CartItemCreate,
    db: Session = Depends(get_db)
):
    # Find the customer's cart
    cart = (
        db.query(Cart)
        .filter(Cart.customer_id == customer_id)
        .first()
    )

    # Create a cart if the customer doesn't have one
    if cart is None:
        cart = Cart(customer_id=customer_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check whether the product exists
    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check whether this product is already in the cart
    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == cart_item.product_id
        )
        .first()
    )

    # If product is already in cart, increase quantity
    if existing_item:
        existing_item.quantity += cart_item.quantity

        db.commit()
        db.refresh(existing_item)

        return existing_item

    # Otherwise create a new cart item
    new_item = CartItem(
        cart_id=cart.id,
        product_id=cart_item.product_id,
        quantity=cart_item.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item

@app.put("/cart/items/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db)
):
    cart_item = ( #searching the cart_items table
        db.query(CartItem)
        .filter(CartItem.id == cart_item_id)
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    if item_update.quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1"
        )

    cart_item.quantity = item_update.quantity

    db.commit()
    db.refresh(cart_item)

    return {
        "message": "Cart item quantity updated successfully",
        "cart_item_id": cart_item.id,
        "quantity": cart_item.quantity
    }

@app.delete("/cart/items/{cart_item_id}")
def remove_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db)
):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == cart_item_id) #finds the specific item
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit() #removes from PostgreSQL

    return {
        "message": "Item removed from cart successfully"
    }

@app.get("/cart/{customer_id}/count")
def get_cart_count(
    customer_id: int,
    db: Session = Depends(get_db)
):
    cart = (
        db.query(Cart)
        .filter(Cart.customer_id == customer_id)
        .first()
    )

    if cart is None:
        return {
            "cart_count": 0
        }

    cart_items = ( #gets all products inside cart
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    total_quantity = sum(
        item.quantity for item in cart_items
    )

    return {
        "cart_count": total_quantity
    }

#Customer
@app.post("/customers", response_model=CustomerResponse) #accepts post request
def create_customer(
    customer: CustomerCreate, #FastAPI expects data matching
    db: Session = Depends(get_db)
):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.email == customer.email)
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(customer.password)

    calculated_age = calculate_age(
        customer.date_of_birth
    )

    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        password=hashed_password,
        role="customer",
        age=calculated_age,
        date_of_birth=customer.date_of_birth,
        gender=customer.gender,
        location=customer.location
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer

#login customer
@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db) #db session
):
    existing_customer = ( #find the customer
        db.query(Customer)
        .filter(Customer.email == form_data.username)
        .first()
    )

    if existing_customer is None:
        raise HTTPException(
            status_code=401, #401 means the request isn't authenticated with valid credentials
            detail="Invalid email or password"
        )

    password_is_correct = verify_password(
        form_data.password, #usertyped password
        existing_customer.password #hash stored in postgreSQL
    )

    if not password_is_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(
    data={
        "sub": str(existing_customer.id), #sub stands for subject to identify who the token belongs to
        "role": existing_customer.role
    }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "customer_id": existing_customer.id,
        "name": existing_customer.name,
        "email": existing_customer.email,
        "role": existing_customer.role
    }
@app.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(Customer)
        .filter(Customer.email == request.email.strip())
        .first()
    )

    # Do not reveal whether an email exists
    if customer is None:
        return {
            "message": "If an account with this email exists, a password reset link has been generated."
        }

    # Create a short-lived reset token
    reset_token = create_access_token(
        data={
            "sub": str(customer.id),
            "purpose": "password_reset"
        },
        expires_delta=timedelta(minutes=15)
    )

    # Development link
    reset_link = (
        f"http://localhost:5173/reset-password?token={reset_token}"
    )

    return {
        "message": "Password reset link generated successfully.",
        "reset_link": reset_link
    }

@app.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            request.token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Make sure this token was created specifically
        # for password resetting
        if payload.get("purpose") != "password_reset":
            raise HTTPException(
                status_code=400,
                detail="Invalid password reset token."
            )

        customer_id = payload.get("sub")

        if customer_id is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid password reset token."
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=400,
            detail="Password reset link has expired."
        )

    except jwt.JWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid password reset token."
        )

    customer = (
        db.query(Customer)
        .filter(Customer.id == int(customer_id))
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer account not found."
        )

    # Validate new password
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    if not any(char.isupper() for char in request.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter."
        )

    if not any(char.islower() for char in request.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter."
        )

    if not any(char.isdigit() for char in request.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number."
        )

    # Hash the new password
    customer.password = hash_password(
        request.new_password
    )

    db.commit()
    db.refresh(customer)

    return {
        "message": "Password reset successfully. You can now log in with your new password."
    }

@app.get("/auth-test")
def auth_test(
    current_user: Customer = Depends(get_current_user) #find out who logged in user is
):
    return {
        "message": "Authentication successful",
        "customer_id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@app.get("/customer-test")
def customer_test(
    current_user: Customer = Depends(
        require_role("customer")
    )
):
    return {
        "message": "Customer access granted",
        "name": current_user.name,
        "role": current_user.role
    }

@app.get("/employee-test")
def employee_test(
    current_user: Customer = Depends(
        require_role("employee")
    )
):
    return {
        "message": "Employee access granted",
        "name": current_user.name,
        "role": current_user.role
    }

"""@app.get("/manager-test")
def manager_test(
    current_user: Customer = Depends(
        require_role("manager")
    )
):
    return {
        "message": "Manager access granted",
        "name": current_user.name,
        "role": current_user.role
    }"""

@app.get("/admin-test")
def admin_test(
    current_user: Customer = Depends(
        require_role("admin")
    )
):
    return {
        "message": "Admin access granted",
        "name": current_user.name,
        "role": current_user.role
    }

@app.post("/checkout")
def checkout(
    checkout_data: CheckoutRequest,
    current_user: Customer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the customer's cart
    cart = (
        db.query(Cart)
        .filter(Cart.customer_id == current_user.id)
        .first()
    )

    if cart is None:
        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    # Get all items inside the cart
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id)
        .all()
    )

    if not cart_items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total_amount = 0

    # Check stock and calculate total
    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.name}"
            )

        total_amount += get_effective_price(product) * item.quantity
    # Create the sale
    new_sale = Sale(
        customer_id=current_user.id,
        total_amount=total_amount,
        payment_method=checkout_data.payment_method,
        status="pending"
    )

    db.add(new_sale)
    db.flush() #send the pending insert to db so SQLAlchemy can obtain the ID without comminting full transaction

    # Create sale items and reduce inventory
    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        unit_price = get_effective_price(product)
        subtotal = unit_price * item.quantity

        sale_item = SaleItem(
            sale_id=new_sale.id,
            product_id=product.id,
            quantity=item.quantity,
            price=unit_price,
            subtotal=subtotal
        )

        db.add(sale_item)

        # Reduce inventory
        product.stock_quantity -= item.quantity

        # Remove item from cart
        db.delete(item)

    db.commit()
    db.refresh(new_sale)

    return {
        "message": "Checkout successful",
        "sale_id": new_sale.id,
        "customer_id": new_sale.customer_id,
        "total_amount": new_sale.total_amount,
        "payment_method": new_sale.payment_method,
        "status": new_sale.status
    }

#Dashboards
@app.get("/dashboard/inventory")
def inventory_dashboard(
    db: Session = Depends(get_db)
):

    total_products = db.query(Product).count()

    total_stock = (
        db.query(Product.stock_quantity)
        .all()
    )

    total_stock_quantity = sum(
        stock[0] for stock in total_stock
    )

    low_stock = (
        db.query(Product)
        .filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= Product.reorder_level
        )
        .count()
    )

    out_of_stock = (
        db.query(Product)
        .filter(
            Product.stock_quantity == 0
        )
        .count()
    )

    return {
        "total_products": total_products,
        "total_stock": total_stock_quantity,
        "low_stock": low_stock,
        "out_of_stock": out_of_stock
    }

#Inventory details API
@app.get("/dashboard/inventory/details")
def inventory_details(
    db: Session = Depends(get_db)
):

    products = db.query(Product).all() #seperating into categories

    low_stock_products = [
        product
        for product in products
        if product.stock_quantity > 0
        and product.stock_quantity <= product.reorder_level
    ]

    out_of_stock_products = [
        product
        for product in products
        if product.stock_quantity == 0
    ]

    inventory_value = sum(
        product.price * product.stock_quantity
        for product in products
    )

    return {
        "inventory_value": inventory_value,

        "low_stock_products": [
            {
                "id": product.id,
                "name": product.name,
                "stock_quantity": product.stock_quantity,
                "reorder_level": product.reorder_level,
            }
            for product in low_stock_products
        ],

        "out_of_stock_products": [
            {
                "id": product.id,
                "name": product.name,
            }
            for product in out_of_stock_products
        ],
    }

@app.get("/sales", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):
    sales = (
        db.query(Sale)
        .order_by(Sale.created_at.desc())
        .all()
    )

    return sales

#sales response model
VALID_SALE_STATUSES = ["pending", "processing", "completed", "cancelled"]

@app.patch("/sales/{sale_id}/status", response_model=SaleResponse)
def update_sale_status(
    sale_id: int,
    status_update: SaleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):
    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="Only administrators and employees can update order status."
        )

    if status_update.status not in VALID_SALE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of {VALID_SALE_STATUSES}"
        )

    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if sale is None:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    sale.status = status_update.status
    db.commit()
    db.refresh(sale)

    return sale

@app.get(
    "/customers/dashboard",
    response_model=list[CustomerDashboardResponse]
)
def get_customer_dashboard(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # Only Admin and Employee can access dashboard customer data
    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view customer data."
        )

    customers = db.query(Customer).all()

    result = []

    for customer in customers:

        total_orders = (
            db.query(Sale)
            .filter(
                Sale.customer_id == customer.id,
                Sale.status == "completed"
            )
            .count()
        )

        total_spending = (
            db.query(
                func.coalesce(
                    func.sum(Sale.total_amount),
                    0
                )
            )
            .filter(
                Sale.customer_id == customer.id,
                Sale.status == "completed"
            )
            .scalar()
        )

        result.append(
            {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email,
                "role": customer.role,
                "age": customer.age,
                "gender": customer.gender,
                "location": customer.location,
                "total_orders": total_orders,
                "total_spending": float(total_spending)
            }
        )

    return result

@app.get(
    "/intelligence",
    response_model=list[IntelligenceProductResponse]
)
def get_inventory_intelligence(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user) #verifies that someone is logged in 
):

    products = db.query(Product).all()

    result = []

    for product in products:

        if product.stock_quantity <= product.reorder_level:

            suggested_quantity = (
                product.reorder_level * 2
                - product.stock_quantity
            )

            result.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "stock_quantity": product.stock_quantity,
                    "reorder_level": product.reorder_level,
                    "suggested_reorder_quantity": max(
                        suggested_quantity,
                        0
                    )
                }
            )

    return result

#calculated business intelligence for dashbaord sales
@app.get("/dashboard/sales")
def get_sales_dashboard(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

 #get all sales
    sales = (
        db.query(Sale)
        .order_by(Sale.created_at.desc())
        .all()
    )

   
    # 2. BASIC SALES CALCULATIONS
   
    total_revenue = sum(
        sale.total_amount for sale in sales
    )

    total_orders = len(sales)

    average_order_value = (
        total_revenue / total_orders
        if total_orders > 0
        else 0
    )

    # 3. TOTAL UNITS SOLD
    total_units_sold = (
        db.query(func.coalesce(func.sum(SaleItem.quantity), 0))
        .scalar()
    )

    # 4. PAYMENT METHOD BREAKDOWN

    payment_method_group = case(
        (Sale.payment_method.in_(["cash", "cash_on_delivery"]), "Cash"),
        else_=Sale.payment_method
        ).label("payment_method")

    payment_results = (
        db.query(
            payment_method_group,
            func.count(Sale.id).label("orders")
        )
        .group_by(payment_method_group)
        .all()
    )

    payment_breakdown = [
        {
            "payment_method": payment_method,
            "orders": orders
        }
        for payment_method, orders in payment_results
    ]

    """payment_results = (
        db.query(
            Sale.payment_method,
            func.count(Sale.id)
        )
        .group_by(Sale.payment_method)
        .all()
    )

    payment_breakdown = [
        {
            "payment_method": payment_method,
            "orders": orders
        }
        for payment_method, orders in payment_results
    ]"""

    # 5. TOP SELLING PRODUCTS
    
    #group sale items by product and calculate how many units of each product were sold
    product_results = (
        db.query(
            Product.name,
            func.sum(SaleItem.quantity).label("units_sold"),
            func.sum(SaleItem.subtotal).label("revenue")
        )
        .join(
            SaleItem,
            Product.id == SaleItem.product_id
        )
        .group_by(Product.id, Product.name)
        .order_by(
            func.sum(SaleItem.quantity).desc()
        )
        .all()
    )

    top_products = [
        {
            "product_name": product_name,
            "units_sold": int(units_sold),
            "revenue": float(revenue)
        }
        for product_name, units_sold, revenue in product_results
    ]

    
    # 6. MONTHLY REVENUE

    monthly_results = (
        db.query(
            func.date_trunc("month", Sale.created_at).label("month"), #groups sales according to the month in which they occurred
            func.sum(Sale.total_amount).label("revenue")
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    monthly_revenue = [
        {
            "month": month.strftime("%Y-%m"),
            "revenue": float(revenue)
        }
        for month, revenue in monthly_results
    ]


    # 7. RECENT SALES

    recent_sales = []

    for sale in sales[:10]:

        customer = (
            db.query(Customer)
            .filter(Customer.id == sale.customer_id)
            .first()
        )

        recent_sales.append({
            "id": sale.id,
            "customer_id": sale.customer_id,
            "customer_name": customer.name if customer else "Unknown",
            "total_amount": sale.total_amount,
            "payment_method": sale.payment_method,
            "status": sale.status,
            "created_at": sale.created_at
        })

    
    # 8. RETURN DASHBOARD DATA


    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": average_order_value,
        "total_units_sold": int(total_units_sold),

        "payment_breakdown": payment_breakdown,

        "top_products": top_products,

        "monthly_revenue": monthly_revenue,

        "recent_sales": recent_sales
    }

#customer analytics and buying behvaiour
@app.get("/dashboard/customers")
def get_customer_analytics(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # ROLE CHECK
    if current_user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view customer analytics."
        )

    # GET ONLY REAL CUSTOMERs

    customers = (
        db.query(Customer)
        .filter(Customer.role == "customer")
        .all()
    )

    # BASIC CUSTOMER SUMMARY

    total_customers = len(customers)

    total_orders = (
        db.query(Sale)
        .join(Customer, Customer.id == Sale.customer_id)
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .count()
    )


    total_spending = (
        db.query(
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            )
        )
        .join(Customer, Customer.id == Sale.customer_id)
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .scalar()
    )


    average_customer_spending = (
        float(total_spending) / total_customers
        if total_customers > 0
        else 0
    )

    # AGE GROUP ANALYSIS

    age_groups = {
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45+": 0
    }


    for customer in customers:

        if customer.age is None:
            continue

        if 18 <= customer.age <= 24:
            age_groups["18-24"] += 1

        elif 25 <= customer.age <= 34:
            age_groups["25-34"] += 1

        elif 35 <= customer.age <= 44:
            age_groups["35-44"] += 1

        elif customer.age >= 45:
            age_groups["45+"] += 1


    age_group_data = [
        {
            "age_group": group,
            "customers": count
        }
        for group, count in age_groups.items()
    ]

    # GENDER ANALYSIS

    gender_results = (
        db.query(
            Customer.gender,
            func.count(Customer.id)
        )
        .filter(
            Customer.role == "customer"
        )
        .group_by(Customer.gender)
        .all()
    )


    gender_data = [
        {
            "gender": gender,
            "customers": count
        }
        for gender, count in gender_results
    ]

    # LOCATION ANALYSIS

    location_results = (
        db.query(
            Customer.location,
            func.count(Customer.id)
        )
        .filter(
            Customer.role == "customer"
        )
        .group_by(Customer.location)
        .order_by(
            func.count(Customer.id).desc()
        )
        .all()
    )


    location_data = [
        {
            "location": location,
            "customers": count
        }
        for location, count in location_results
    ]
    # TOP CUSTOMERS BY SPENDING

    top_customer_results = (
        db.query(
            Customer.id,
            Customer.name,
            func.count(Sale.id).label("orders"),
            func.coalesce(
                func.sum(Sale.total_amount),
                0
            ).label("spending")
        )
        .join(
            Sale,
            Customer.id == Sale.customer_id
        )
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .group_by(
            Customer.id,
            Customer.name
        )
        .order_by(
            func.sum(Sale.total_amount).desc()
        )
        .all()
    )


    top_customers = [
        {
            "id": customer_id,
            "name": name,
            "orders": orders,
            "spending": float(spending)
        }
        for customer_id, name, orders, spending
        in top_customer_results
    ]

    # POPULAR PRODUCTS

    product_results = (
        db.query(
            Product.name,
            func.sum(SaleItem.quantity).label("units_sold")
        )
        .join(
            SaleItem,
            Product.id == SaleItem.product_id
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .join(
            Customer,
            Customer.id == Sale.customer_id
        )
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(SaleItem.quantity).desc()
        )
        .all()
    )


    popular_products = [
        {
            "product_name": product_name,
            "units_sold": int(units_sold)
        }
        for product_name, units_sold
        in product_results
    ]

    # CATEGORY BUYING BEHAVIOR
    category_results = (
        db.query(
            Product.category,
            func.sum(SaleItem.quantity).label("units_sold")
        )
        .join(
            SaleItem,
            Product.id == SaleItem.product_id
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .join(
            Customer,
            Customer.id == Sale.customer_id
        )
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .group_by(
            Product.category
        )
        .order_by(
            func.sum(SaleItem.quantity).desc()
        )
        .all()
    )


    category_behavior = [
        {
            "category": category,
            "units_sold": int(units_sold)
        }
        for category, units_sold
        in category_results
    ]
    # FINAL RESPONSE
    return {
        "summary": {
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_spending": float(total_spending),
            "average_customer_spending": average_customer_spending
        },

        "demographics": {
            "age_groups": age_group_data,
            "gender": gender_data,
            "location": location_data
        },

        "buying_behavior": {
            "top_customers": top_customers,
            "popular_products": popular_products,
            "category_behavior": category_behavior
        }
    }

##business inteligence inventory
@app.get("/dashboard/intelligence")
def get_dashboard_intelligence(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):
    # ROLE CHECK

    if current_user.role != "admin":
     raise HTTPException(
        status_code=403,
        detail="You do not have permission to view intelligence."
    )

    # INVENTORY ANALYSIS
    products = db.query(Product).all()

    total_products = len(products)

    out_of_stock_products = [
        product
        for product in products
        if product.stock_quantity == 0
    ]

    low_stock_products = [
        product
        for product in products
        if product.stock_quantity > 0
        and product.stock_quantity <= product.reorder_level
    ]


    # Create reorder recommendations
    reorder_recommendations = []

    for product in products:

        if product.stock_quantity <= product.reorder_level:

            suggested_quantity = (
                product.reorder_level * 2
                - product.stock_quantity
            )

            reorder_recommendations.append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "current_stock": product.stock_quantity,
                    "reorder_level": product.reorder_level,
                    "suggested_reorder": max(
                        suggested_quantity,
                        0
                    ),
                    "priority": (
                        "High"
                        if product.stock_quantity == 0
                        else "Medium"
                    )
                }
            )

    # SALES ANALYSIS

    completed_sales = (
        db.query(Sale)
        .filter(
            Sale.status == "completed"
        )
        .all()
    )


    total_revenue = sum(
        sale.total_amount
        for sale in completed_sales
    )

    total_orders = len(completed_sales)

    average_order_value = (
        total_revenue / total_orders
        if total_orders > 0
        else 0
    )


    total_units_sold = (
        db.query(
            func.coalesce(
                func.sum(SaleItem.quantity),
                0
            )
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .filter(
            Sale.status == "completed"
        )
        .scalar()
    )


    # TOP SELLING PRODUCT

    top_product_result = (
        db.query(
            Product.name,
            func.sum(
                SaleItem.quantity
            ).label("units_sold")
        )
        .join(
            SaleItem,
            Product.id == SaleItem.product_id
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .filter(
            Sale.status == "completed"
        )
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(
                SaleItem.quantity
            ).desc()
        )
        .first()
    )


    top_product = None

    if top_product_result:

        top_product = {
            "name": top_product_result[0],
            "units_sold": int(
                top_product_result[1]
            )
        }


    # TOP SELLING CATEGORY

    top_category_result = (
        db.query(
            Product.category,
            func.sum(
                SaleItem.quantity
            ).label("units_sold")
        )
        .join(
            SaleItem,
            Product.id == SaleItem.product_id
        )
        .join(
            Sale,
            Sale.id == SaleItem.sale_id
        )
        .filter(
            Sale.status == "completed"
        )
        .group_by(
            Product.category
        )
        .order_by(
            func.sum(
                SaleItem.quantity
            ).desc()
        )
        .first()
    )


    top_category = None

    if top_category_result:

        top_category = {
            "category": top_category_result[0],
            "units_sold": int(
                top_category_result[1]
            )
        }


    # CUSTOMER ANALYSIS

    customers = (
        db.query(Customer)
        .filter(
            Customer.role == "customer"
        )
        .all()
    )


    total_customers = len(customers)


    # Customers who have completed at least one order
    active_buyers = (
        db.query(
            func.count(
                func.distinct(
                    Sale.customer_id
                )
            )
        )
        .join(
            Customer,
            Customer.id == Sale.customer_id
        )
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .scalar()
    )


    # TOP CUSTOMER

    top_customer_result = (
        db.query(
            Customer.name,
            func.count(
                Sale.id
            ).label("orders"),
            func.sum(
                Sale.total_amount
            ).label("spending")
        )
        .join(
            Sale,
            Customer.id == Sale.customer_id
        )
        .filter(
            Customer.role == "customer",
            Sale.status == "completed"
        )
        .group_by(
            Customer.id,
            Customer.name
        )
        .order_by(
            func.sum(
                Sale.total_amount
            ).desc()
        )
        .first()
    )


    top_customer = None

    if top_customer_result:

        top_customer = {
            "name": top_customer_result[0],
            "orders": int(
                top_customer_result[1]
            ),
            "spending": float(
                top_customer_result[2]
            )
        }


    # CUSTOMER DEMOGRAPHIC ANALYSIS

    age_group_counts = {
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45+": 0
    }


    for customer in customers:

        if customer.age is None:
            continue

        if 18 <= customer.age <= 24:
            age_group_counts["18-24"] += 1

        elif 25 <= customer.age <= 34:
            age_group_counts["25-34"] += 1

        elif 35 <= customer.age <= 44:
            age_group_counts["35-44"] += 1

        elif customer.age >= 45:
            age_group_counts["45+"] += 1


    dominant_age_group = max(
        age_group_counts,
        key=age_group_counts.get
    )


    location_result = (
        db.query(
            Customer.location,
            func.count(Customer.id)
        )
        .filter(
            Customer.role == "customer"
        )
        .group_by(
            Customer.location
        )
        .order_by(
            func.count(Customer.id).desc()
        )
        .first()
    )


    dominant_location = None

    if location_result:

        dominant_location = {
            "location": location_result[0],
            "customers": int(
                location_result[1]
            )
        }

    # RULE-BASED BUSINESS INSIGHTS

    insights = []


    # Inventory rule
    if len(out_of_stock_products) > 0:

        insights.append(
            {
                "type": "inventory",
                "priority": "High",
                "title": "Out-of-stock products require attention",
                "message": (
                    f"{len(out_of_stock_products)} "
                    "product(s) currently have zero stock. "
                    "Restocking should be prioritized."
                )
            }
        )


    elif len(low_stock_products) > 0:

        insights.append(
            {
                "type": "inventory",
                "priority": "Medium",
                "title": "Low stock products detected",
                "message": (
                    f"{len(low_stock_products)} "
                    "product(s) are at or below their reorder level."
                )
            }
        )


    # Sales rule
    if top_product:

        insights.append(
            {
                "type": "sales",
                "priority": "Info",
                "title": "Top selling product",
                "message": (
                    f"{top_product['name']} is currently "
                    f"the most purchased product with "
                    f"{top_product['units_sold']} unit(s) sold."
                )
            }
        )


    # Category rule
    if top_category:

        insights.append(
            {
                "type": "sales",
                "priority": "Info",
                "title": "Strongest product category",
                "message": (
                    f"{top_category['category']} is currently "
                    f"the leading category with "
                    f"{top_category['units_sold']} unit(s) sold."
                )
            }
        )


    # Customer rule
    if top_customer:

        insights.append(
            {
                "type": "customer",
                "priority": "Info",
                "title": "Highest-spending customer",
                "message": (
                    f"{top_customer['name']} has generated "
                    f"Rs. {top_customer['spending']:,.2f} "
                    "from completed orders."
                )
            }
        )


    # Demographic rule
    if total_customers > 0:

        insights.append(
            {
                "type": "customer",
                "priority": "Info",
                "title": "Largest customer age segment",
                "message": (
                    f"The {dominant_age_group} age group "
                    "currently represents the largest customer segment."
                )
            }
        )

        # ABC CLASSIFICATION
    # Groups products into Class A / B / C based on their share
    # of total revenue (the Pareto / 80-15-5 rule).

    product_revenue = {product.id: 0 for product in products}

    revenue_rows = (
        db.query(
            SaleItem.product_id,
            func.sum(SaleItem.subtotal).label("revenue")
        )
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.status == "completed")
        .group_by(SaleItem.product_id)
        .all()
    )

    for row in revenue_rows:
        product_revenue[row.product_id] = float(row.revenue)

    # Highest revenue first
    sorted_products = sorted(
        products,
        key=lambda p: product_revenue[p.id],
        reverse=True
    )

    total_product_revenue = sum(product_revenue.values())

    abc_classification = []
    running_total = 0

    for product in sorted_products:

        revenue = product_revenue[product.id]
        running_total += revenue

        cumulative_percent = (
            (running_total / total_product_revenue) * 100
            if total_product_revenue > 0
            else 0
        )

        if cumulative_percent <= 80:
            abc_class = "A"
        elif cumulative_percent <= 95:
            abc_class = "B"
        else:
            abc_class = "C"

        abc_classification.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "revenue": revenue,
                "class": abc_class
            }
        )

    # FINAL RESPONSE
    return {

        "summary": {

            "total_products": total_products,

            "low_stock": len(
                low_stock_products
            ),

            "out_of_stock": len(
                out_of_stock_products
            ),

            "total_revenue": float(
                total_revenue
            ),

            "total_orders": total_orders,

            "average_order_value": float(
                average_order_value
            ),

            "total_units_sold": int(
                total_units_sold
            ),

            "total_customers": total_customers,

            "active_buyers": int(
                active_buyers or 0
            )

        },


        "inventory": {

            "out_of_stock": [
                {
                    "name": product.name,
                    "stock": product.stock_quantity,
                    "reorder_level": product.reorder_level
                }
                for product in out_of_stock_products
            ],

            "low_stock": [
                {
                    "name": product.name,
                    "stock": product.stock_quantity,
                    "reorder_level": product.reorder_level
                }
                for product in low_stock_products
            ],

            "reorder_recommendations":
                reorder_recommendations,

            "abc_classification":
                abc_classification

        },


        "sales": {

            "top_product": top_product,

            "top_category": top_category

        },


        "customers": {

            "top_customer": top_customer,

            "dominant_age_group":
                dominant_age_group,

            "dominant_location":
                dominant_location

        },


        "insights": insights

    }

@app.get("/admin/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # Only Admin can manage users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can manage users."
        )

    users = (
        db.query(Customer)
        .order_by(Customer.role, Customer.name)
        .all()
    )

    return users

#admin can create users
@app.post("/admin/users")
def create_admin_user(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # Only Admin can add users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can add users."
        )


    # Validate role
    allowed_roles = [
        "customer",
        "employee",
        "admin"
    ]

    if user_data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role."
        )


    # Check duplicate email
    existing_user = (
        db.query(Customer)
        .filter(
            Customer.email == user_data.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )


    # Hash password before storing
    hashed_password = hash_password(
        user_data.password
    )


    # Create new user
    new_user = Customer(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
        age=user_data.age,
        gender=user_data.gender,
        location=user_data.location
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return {
        "message": "User created successfully.",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "age": new_user.age,
        "gender": new_user.gender,
        "location": new_user.location
    }

#edit user endpoints
@app.put("/admin/users/{user_id}")
def update_admin_user(
    user_id: int,
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # Only Admin can edit users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can edit users."
        )


    # Find user
    user = (
        db.query(Customer)
        .filter(Customer.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    # Validate role
    allowed_roles = [
        "customer",
        "employee",
        "admin"
    ]

    if user_data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role."
        )


    # Check whether email belongs to another user
    existing_user = (
        db.query(Customer)
        .filter(
            Customer.email == user_data.email,
            Customer.id != user_id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered by another user."
        )


    # Update basic information
    user.name = user_data.name
    user.email = user_data.email
    user.role = user_data.role
    user.age = user_data.age
    user.gender = user_data.gender
    user.location = user_data.location


    # Only replace password if Admin provides one
    if user_data.password:
        user.password = hash_password(
            user_data.password
        )


    db.commit()
    db.refresh(user)


    return {
        "message": "User updated successfully.",
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "age": user.age,
        "gender": user.gender,
        "location": user.location
    }

#delete user endpoint
@app.delete("/admin/users/{user_id}")
def delete_admin_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Customer = Depends(get_current_user)
):

    # Only Admin can delete users
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can delete users."
        )


    # Prevent Admin from deleting their own account
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )


    # Find user
    user = (
        db.query(Customer)
        .filter(Customer.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )


    db.delete(user)
    db.commit()


    return {
        "message": "User deleted successfully."
    }