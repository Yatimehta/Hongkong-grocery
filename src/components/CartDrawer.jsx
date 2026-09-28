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

  const subtotal = cartTotal;
  const threshold = Number(settings?.free_delivery_threshold || 1000);
  const baseDeliveryFee = Number(settings?.base_delivery_fee || 60);
  const isFreeDelivery = subtotal >= threshold;
  const deliveryFee = cartItems.length === 0 ? 0 : (isFreeDelivery ? 0 : baseDeliveryFee);
  const orderTotal = subtotal + deliveryFee;
  const amountToFree = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));

  if (!isCartOpen) return null;

  const handleWhatsAppOrder = () => {
    if (cartItems.length === 0) return;

    let message = "Hi, I'd like to place an order with Waqas Provision Store:\n\n";
    message += "📦 *Order Items:*\n";
    cartItems.forEach(item => {
      message += `- ${item.name} (x${item.quantity}) - HK$${((item.price != null ? item.price : 0) * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Subtotal:* HK$${subtotal.toFixed(2)}`;
    message += `\n*Delivery Charge:* ${isFreeDelivery ? 'FREE (Order above $1,000)' : `HK$${deliveryFee.toFixed(2)}`}`;
    message += `\n*Grand Total:* HK$${orderTotal.toFixed(2)}`;
    message += `\n\nDelivery Address: `;
    
    // Clean phone number (keep only digits)
    const rawNumber = settings?.whatsapp_number || '85290291454';
    const cleanNumber = rawNumber.replace(/\D/g, '');
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={closeCart} />
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={closeCart}>&times;</button>
        </div>

        {/* Free Delivery Incentive Progress Bar */}
        {cartItems.length > 0 && (
          <div className="cart-delivery-incentive">
            <div className="delivery-incentive-header">
              <span className="incentive-icon">{isFreeDelivery ? '🎉' : '🚚'}</span>
              <span className="incentive-text">
                {isFreeDelivery ? (
                  <strong>You've unlocked FREE Delivery!</strong>
                ) : (
                  <>
                    Add <strong>HK${amountToFree.toFixed(2)}</strong> more for <strong>FREE Delivery</strong>
                  </>
                )}
              </span>
            </div>
            <div className="delivery-progress-track">
              <div 
                className={`delivery-progress-fill ${isFreeDelivery ? 'completed' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="delivery-incentive-sub">
              {isFreeDelivery 
                ? 'Free delivery automatically applied!' 
                : 'Free delivery for orders above $1,000 • $60 fee below $1,000'}
            </div>
          </div>
        )}

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
                <span>HK${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row delivery-row">
                <span className="delivery-row-label">
                  <span>Delivery Charge</span>
                  <span className="delivery-rule-badge">
                    {isFreeDelivery ? 'Over $1,000' : 'Under $1,000'}
                  </span>
                </span>
                <span className={isFreeDelivery ? 'free-delivery-text' : 'delivery-fee-text'}>
                  {isFreeDelivery ? 'FREE' : `HK$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-summary-row total">
                <span>Total</span>
                <span>HK${orderTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="delivery-policy-note">
              🚚 <strong>Delivery Policy:</strong> Free delivery on all orders above $1,000 USD / HKD. Orders below $1,000 incur a standard $60 delivery charge.
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
