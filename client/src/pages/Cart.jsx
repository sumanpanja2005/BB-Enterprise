import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const shipping = subtotal >= 50 ? 0 : 7.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  return (
    <>
      <SEO title="Shopping bag" path="/cart" />
      <div className="section cart-page">
        <div className="container">
          <h1>Shopping bag</h1>
          {items.length === 0 ? (
            <div className="empty-state card cart-empty">
              <p>Your bag is empty.</p>
              <Link to="/shop" className="btn btn-primary">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {items.map((line) => (
                  <div key={line.productId} className="cart-line card">
                    <Link to={`/product/${line.slug}`} className="cart-line-img">
                      {line.image ? (
                        <img src={line.image} alt="" />
                      ) : (
                        <div className="cart-line-ph" />
                      )}
                    </Link>
                    <div className="cart-line-body">
                      <Link to={`/product/${line.slug}`} className="cart-line-title">
                        {line.name}
                      </Link>
                      <p className="cart-line-price">${line.price.toFixed(2)} each</p>
                      <div className="cart-line-actions">
                        <div className="qty-control">
                          <button
                            type="button"
                            onClick={() => updateQty(line.productId, line.qty - 1)}
                          >
                            −
                          </button>
                          <span>{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(line.productId, line.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost cart-remove"
                          onClick={() => removeItem(line.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-total">
                      ${(line.price * line.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <aside className="cart-summary card">
                <h2>Order summary</h2>
                <div className="cart-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="cart-row">
                  <span>Est. tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="cart-row cart-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary cart-checkout">
                  Checkout
                </Link>
                <Link to="/shop" className="btn btn-outline cart-continue">
                  Keep shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
