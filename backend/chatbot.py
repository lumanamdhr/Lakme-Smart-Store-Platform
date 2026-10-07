from models import Product, Sale
from entities import extract_category, extract_product, extract_order_number
from recommender import get_recommendations

from text_utils import tokenize, compute_idf, to_tfidf_vector, cosine_similarity

# Example phrases per intent. The more varied examples you give,
# the better it'll recognize differently-worded real questions.
INTENT_EXAMPLES = {
    "product_search": [
        "do you have eyeliner",
        "looking for lipstick",
        "where can i find foundation",
        "show me skincare products",
        "i want to buy mascara",
        "is there any sunscreen",
        "do you sell lip balm",
        "search for eyeshadow",
        "do you have eyeshadow",
        "is eyeshadow available",
        "do you have sunscream"
    ],
    "recommend": [
        "what goes well with this",
        "recommend me something",
        "suggest something similar",
        "what should i pair this with",
        "similar items to this one",
        "what pairs well with it",
        "any suggestions for me",
        "show me similar items",
        "what else should i buy with this",
    ],
    "order_status": [
        "where is my order",
        "track my order",
        "what is the status of my order",
        "has my order shipped",
        "order tracking",
        "check order number 12",
    ],
}

# Flatten every example from every intent into one training set,
# so word-rarity is judged fairly across the whole chatbot's vocabulary.
_all_tokenized = []
_example_intents = []

for intent, examples in INTENT_EXAMPLES.items():
    for example in examples:
        _all_tokenized.append(tokenize(example))
        _example_intents.append(intent)

_idf = compute_idf(_all_tokenized)
_example_vectors = [to_tfidf_vector(tokens, _idf) for tokens in _all_tokenized]

#vectorizes the incoming message using the training idf weights and then compares it agaist every single training example
def classify_intent(message, threshold=0.15): #tgreshold=0.15 we return unknown even the best match is weak similarity
    message_vector = to_tfidf_vector(tokenize(message), _idf)

    best_score = 0
    best_intent = None

    for vector, intent in zip(_example_vectors, _example_intents):
        score = cosine_similarity(message_vector, vector)
        if score > best_score:
            best_score = score
            best_intent = intent

    if best_score < threshold:
        return "unknown", best_score

    return best_intent, best_score

#response part
def get_response(db, message):
    intent, confidence = classify_intent(message)

    if intent == "product_search":
        all_products = db.query(Product).filter(Product.stock_quantity > 0).all()
        category = extract_category(message)

        if category:
            results = [p for p in all_products if p.category == category][:5]
        else:
            GENERIC_SEARCH_WORDS = {"show", "products", "product", "give"}
            named_match = extract_product(message, all_products)
            meaningful_words = [
                word for word in tokenize(message) if word not in GENERIC_SEARCH_WORDS
            ]

            if named_match:
                results = [named_match]
            elif meaningful_words:
                # they mentioned something specific, but nothing matched — be honest
                return {
                    "reply": "Sorry, we don't carry that. We have Lips, Face, Eyes and Skincare products.",
                    "products": [],
                }
            else:
                results = all_products[:5]

        if not results:
            return {"reply": "Sorry, I couldn't find anything matching that.", "products": []}

        names = ", ".join(p.name for p in results)
        return {"reply": f"Here's what I found: {names}", "products": results}
    elif intent == "recommend": #calls the get_recommendation function from recommender.py
        all_products = db.query(Product).all()
        target = extract_product(message, all_products)

        if not target:
            return {"reply": "Which product would you like suggestions for? Try mentioning its name.", "products": []}

        recs = [p for p in get_recommendations(db, target.id) if p.stock_quantity > 0]
        if not recs:
            return {"reply": f"I couldn't find anything similar to {target.name} yet.", "products": []}

        names = ", ".join(p.name for p in recs)
        return {"reply": f"If you like {target.name}, you might also like: {names}", "products": recs}

    elif intent == "order_status": #order_status queries real Sale table by extracted order number
        order_number = extract_order_number(message)

        if not order_number:
            return {"reply": "Could you share your order number? e.g. 'where is order 45'", "products": []}

        sale = db.query(Sale).filter(Sale.id == order_number).first()
        if not sale:
            return {"reply": f"I couldn't find an order with number {order_number}.", "products": []}

        return {"reply": f"Order #{sale.id} is currently '{sale.status}'.", "products": []}

    else:
        return {
            "reply": "Sorry, I didn't quite understand that. You can ask me to find products, get recommendations, or check an order's status.",
            "products": [],
        }


# Quick way to test this file by itself, before we wire up anything else
if __name__ == "__main__":
    from database import SessionLocal

    db = SessionLocal()
    print("Chat with the bot ('quit' to stop):")

    while True:
        message = input("> ")
        if message.lower() == "quit":
            break

        result = get_response(db, message)
        print(f"  Bot: {result['reply']}")

    db.close()