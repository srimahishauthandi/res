/*
 * Zafran - The Indian Kitchen
 * Custom JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STICKY NAVBAR & NAV ACTIVE LINKS ---
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky class toggle
        if (window.scrollY > 50) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }

        // Active link highlighting on scroll
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Hamburger Menu Toggle
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navbarNav = document.querySelector('.navbar-nav');

    hamburgerBtn.addEventListener('click', () => {
        navbarNav.classList.toggle('show');
        const icon = hamburgerBtn.querySelector('i');
        if (navbarNav.classList.contains('show')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbarNav.classList.remove('show');
            const icon = hamburgerBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });


    // --- DYNAMIC MENU FILTERING ---
    const tabButtons = document.querySelectorAll('.menu-tab-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs, add to clicked
            tabButtons.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            menuCards.forEach(card => {
                // Apply a quick fade out before filtering
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                setTimeout(() => {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.style.display = 'flex';
                        // Force layout reflow
                        card.offsetHeight; 
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });


    // --- CUSTOM BANNER TOAST ---
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');

    function showToast(message) {
        alertMessage.textContent = message;
        alertBanner.classList.add('show');
        
        setTimeout(() => {
            alertBanner.classList.remove('show');
        }, 3000);
    }


    // --- SHOPPING CART STATE & LOGIC ---
    let cart = [];

    const cartIconBtn = document.querySelector('.cart-icon-btn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartBadge = document.querySelector('.cart-badge');
    const cartBody = document.querySelector('.cart-body');
    const cartSubtotalVal = document.getElementById('cartSubtotalVal');
    const checkoutForm = document.getElementById('checkoutForm');
    const orderBtn = document.querySelector('.btn-order-menu'); // CTA Hero Button
    const orderBtnNav = document.getElementById('navBookBtn'); // Book a table in Nav

    // Toggle Drawer Open/Close
    function toggleCart(openState) {
        if (openState) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = 'auto'; // Restore background scrolling
        }
    }

    cartIconBtn.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    // Handle Hero CTA "Order Online" or "Book a Table" clicks
    const orderOnlineHeroBtn = document.getElementById('orderOnlineHeroBtn');
    if (orderOnlineHeroBtn) {
        orderOnlineHeroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
                showToast("Welcome! Explore our menu and add items to your cart.");
            }
        });
    }

    // Add Item to Cart
    function addToCart(id, name, price, img) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: parseFloat(price),
                img: img,
                quantity: 1
            });
        }
        
        updateCart();
        showToast(`Added ${name} to your cart!`);
    }

    // Remove Item from Cart
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    // Update Quantity
    function updateQty(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCart();
            }
        }
    }

    // Recalculate and Re-render Cart Drawer
    function updateCart() {
        // 1. Update Badge
        const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        cartBadge.textContent = totalItemsCount;
        if (totalItemsCount > 0) {
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }

        // 2. Render Cart Body
        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Your cart is empty</p>
                    <p style="font-size: 13px; color: #999; margin-top: 5px;">Add some delicious dishes from our menu to get started!</p>
                </div>
            `;
            cartSubtotalVal.textContent = '₹0';
            checkoutForm.style.display = 'none';
        } else {
            let html = '';
            let subtotal = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                html += `
                    <div class="cart-item">
                        <div class="cart-item-img">
                            <img src="${item.img}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₹${item.price}</div>
                            <div class="cart-item-qty">
                                <button class="qty-btn minus-qty" data-id="${item.id}">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn plus-qty" data-id="${item.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            });
            
            cartBody.innerHTML = html;
            cartSubtotalVal.textContent = `₹${subtotal}`;
            checkoutForm.style.display = 'flex';

            // Add Event Listeners to item quantity buttons & remove buttons
            const minusBtns = cartBody.querySelectorAll('.minus-qty');
            const plusBtns = cartBody.querySelectorAll('.plus-qty');
            const removeBtns = cartBody.querySelectorAll('.remove-item-btn');

            minusBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    updateQty(id, -1);
                });
            });

            plusBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    updateQty(id, 1);
                });
            });

            removeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    removeFromCart(id);
                });
            });
        }
    }

    // Attach "Add to Cart" listeners to menu items
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const img = btn.getAttribute('data-img');
            addToCart(id, name, price, img);
        });
    });

    // Handle Checkout Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customerName = document.getElementById('checkoutName').value;
        const customerPhone = document.getElementById('checkoutPhone').value;
        const customerAddress = document.getElementById('checkoutAddress').value;

        if (!customerName || !customerPhone || !customerAddress) {
            showToast("Please fill in all checkout details.");
            return;
        }

        // Show order completion
        toggleCart(false);
        showToast(`Thank you, ${customerName}! Your order has been placed. We'll deliver to your address shortly.`);
        
        // Reset Cart
        cart = [];
        updateCart();
        checkoutForm.reset();
    });


    // --- TABLE RESERVATION FORM ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('bookName').value;
            const email = document.getElementById('bookEmail').value;
            const datetime = document.getElementById('bookDateTime').value;
            const guests = document.getElementById('bookGuests').value;
            const request = document.getElementById('bookRequest').value;

            if (!name || !email || !datetime || !guests) {
                showToast("Please fill in all reservation fields.");
                return;
            }

            showToast(`Thank you, ${name}! Your table for ${guests} guests on ${datetime.replace('T', ' ')} is successfully reserved.`);
            bookingForm.reset();
        });
    }


    // --- NEWSLETTER FORM ---
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            if (emailInput && emailInput.value) {
                showToast(`Thank you! You have successfully subscribed to Zafran's newsletter.`);
                emailInput.value = '';
            } else {
                showToast("Please enter a valid email address.");
            }
        });
    }


    // --- TESTIMONIAL CAROUSEL SLIDER ---
    const slider = document.querySelector('.testimonials-slider');
    const dots = document.querySelectorAll('.slider-dot');
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Remove active class from all dots and cards
            dots.forEach(d => d.classList.remove('active'));
            testimonialCards.forEach(c => c.classList.remove('active'));

            dot.classList.add('active');
            
            // Translate the slider container
            const cardWidth = testimonialCards[0].clientWidth + 30; // Card width + gap
            slider.scrollTo({
                left: cardWidth * index,
                behavior: 'smooth'
            });

            // Make the targeted card active/highlighted
            testimonialCards[index].classList.add('active');
        });
    });

    // Listen to manual scrolling in the slider to sync dots
    slider.addEventListener('scroll', () => {
        const cardWidth = testimonialCards[0].clientWidth + 30;
        const scrollPosition = slider.scrollLeft;
        const index = Math.round(scrollPosition / cardWidth);

        if (index >= 0 && index < dots.length) {
            dots.forEach(d => d.classList.remove('active'));
            dots[index].classList.add('active');

            testimonialCards.forEach(c => c.classList.remove('active'));
            testimonialCards[index].classList.add('active');
        }
    });

    // Initialize cart layout on load
    updateCart();
});
