import os
import requests

KHALTI_BASE_URL = "https://a.khalti.com/api/v2/epayment"


def _get_headers():
    secret_key = os.getenv("KHALTI_SECRET_KEY")
    return {"Authorization": f"Key {secret_key}"}


def _get_frontend_url():
    return os.getenv("FRONTEND_URL", "http://localhost:5173")


def initiate_khalti_payment(amount, purchase_order_id, customer):
    frontend_url = _get_frontend_url()

    payload = {
        "return_url": f"{frontend_url}/khalti/verify",
        "website_url": frontend_url,
        "amount": int(round(amount * 100)),
        "purchase_order_id": purchase_order_id,
        "purchase_order_name": "Lakmé Order",
        "customer_info": {
            "name": customer.name,
            "email": customer.email,
        },
    }

    response = requests.post(f"{KHALTI_BASE_URL}/initiate/", headers=_get_headers(), json=payload)
    response.raise_for_status()
    return response.json()


def lookup_khalti_payment(pidx):
    response = requests.post(f"{KHALTI_BASE_URL}/lookup/", headers=_get_headers(), json={"pidx": pidx})
    response.raise_for_status()
    return response.json()