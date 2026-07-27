import React from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../hooks/useStore';
import './CartDrawer.css';

export default function CartDrawer() {
  const { 
    isCartOpen, 
    closeCart, 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartTotal 
  } = useCart();
  const { settings } = useStore();

  if (!isCartOpen) return null;

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    let message = "Hi, I'd like to place an order:\n\n";
    cartItems.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - HK$${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal: HK$${cartTotal.toFixed(2)}`;
    
    // Clean phone number (keep only digits)
    const rawNumber = settings?.whatsapp_number || '85263595566';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    // Note: User explicitly asked not to auto-clear cart
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={closeCart} />
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={closeCart}>&times;</button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Your cart is empty.</p>
              <button className="btn btn-outline" onClick={closeCart}>Continue Shopping</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">📦</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">HK${(item.price != null ? item.price : 0).toFixed(2)}</div>
                    <div className="cart-item-actions">
                      <div className="qty-selector small">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="qty-display">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    HK${((item.price != null ? item.price : 0) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>HK${cartTotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total</span>
                <span>HK${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="cart-drawer-actions">
              <button className="btn btn-primary btn-block btn-whatsapp" onClick={handleWhatsAppOrder}>
                <span className="icon">📱</span> Order via WhatsApp
              </button>
              <button className="btn btn-outline btn-block" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
