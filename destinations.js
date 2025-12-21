
// Destinations Page JavaScript with Google Sheets Integration
document.addEventListener('DOMContentLoaded', function() {
    // 1. Hero slider (keeps existing)
    const heroSlides = document.querySelectorAll('.dest-hero-slide');
    let currentSlide = 0;
    
    if (heroSlides.length > 1 && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        setInterval(() => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }

    // 2. Initialize filtering with existing cards
    initializeDestinationsFiltering();
    
    // 3. Setup other functionality
    setupDestinationsNewsletter();
    setupDestinationsScrollIndicator();
    setupDestinationsLoadMore();
    setupDestinationsIntersectionObserver();
    
    // 4. OPTIONAL: Try to load from Google Sheets in background
    // Uncomment this line and add your Google Sheets URL when ready
    loadDestinationsFromGoogleSheets('https://docs.google.com/spreadsheets/d/e/2PACX-1vSE-bOPVF0xg2wDf6dwJjY_UAUMrfvO7ym6FLgip9pyfu40fYQjcRdHls8Y7VmbGxpXfHueY5NI7SI0/pub?gid=746322432&single=true&output=csv');
});

// Initialize filtering for existing destination cards
function initializeDestinationsFiltering() {
    const filterButtons = document.querySelectorAll('.dest-filter-btn');
    const searchInput = document.getElementById('destination-search');
    const destinationCards = document.querySelectorAll('.dest-card');
    
    if (!destinationCards.length) return;
    
    // Category filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update button states
            filterButtons.forEach(btn => {
                btn.setAttribute('aria-pressed', 'false');
                btn.classList.remove('active');
            });
            this.setAttribute('aria-pressed', 'true');
            this.classList.add('active');
            
            filterDestinations();
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterDestinations);
    }
    
    // Main filtering function
    function filterDestinations() {
        const activeCategory = document.querySelector('.dest-filter-btn.active')?.dataset.category || 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        destinationCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const title = card.querySelector('.dest-card-title').textContent.toLowerCase();
            const description = card.querySelector('.dest-card-description').textContent.toLowerCase();
            const tags = Array.from(card.querySelectorAll('.dest-tag')).map(tag => tag.textContent.toLowerCase());
            
            const categoryMatch = activeCategory === 'all' || cardCategory.includes(activeCategory);
            const searchMatch = !searchTerm || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) ||
                tags.some(tag => tag.includes(searchTerm));
            
            if (categoryMatch && searchMatch) {
                card.style.display = 'block';
                // Add small delay for smooth animation
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
}

// Newsletter functionality
function setupDestinationsNewsletter() {
    const newsletterForm = document.querySelector('.dest-newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const consent = this.querySelector('input[type="checkbox"]').checked;
        
        if (!consent) {
            alert('Please agree to receive updates from us.');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.dest-subscribe-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Show success
            alert('Thank you for subscribing! You will receive our travel updates soon.');
            
            // Reset form
            this.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// Scroll functionality
function setupDestinationsScrollIndicator() {
    const scrollIndicator = document.querySelector('.dest-scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.querySelector('.dest-filter-section').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

// Load more functionality
function setupDestinationsLoadMore() {
    const loadMoreBtn = document.querySelector('.dest-load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            this.innerHTML = 'Loading more destinations...';
            this.disabled = true;
            
            // Simulate loading more
            setTimeout(() => {
                this.style.display = 'none';
                // In a real implementation, you would load more cards here
            }, 1500);
        });
    }
}

// Intersection observer for animations
function setupDestinationsIntersectionObserver() {
    const destinationCards = document.querySelectorAll('.dest-card');
    
    if ('IntersectionObserver' in window && destinationCards.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);
        
        destinationCards.forEach(card => {
            observer.observe(card);
        });
    }
}

// ============================================
// GOOGLE SHEETS INTEGRATION FOR DESTINATIONS
// ============================================

async function loadDestinationsFromGoogleSheets(sheetUrl) {
    try {
        // Show loading indicator
        const grid = document.querySelector('.dest-grid');
        if (!grid) return;
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 25, 41, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            color: var(--dest-color-secondary);
            font-family: var(--dest-font-heading);
        `;
        loadingOverlay.innerHTML = '<div><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading destinations from Google Sheets...</p></div>';
        grid.parentElement.style.position = 'relative';
        grid.parentElement.appendChild(loadingOverlay);
        
        // Fetch CSV data
        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error('Failed to fetch Google Sheets data');
        
        const csvText = await response.text();
        const destinations = parseDestinationsCSVData(csvText);
        
        if (destinations.length > 0) {
            // Clear existing cards
            grid.innerHTML = '';
            
            // Render new cards
            destinations.forEach(dest => {
                const card = createDestinationCardFromData(dest);
                grid.appendChild(card);
            });
            
            // Re-initialize filtering for new cards
            setTimeout(() => {
                initializeDestinationsFiltering();
                setupDestinationsIntersectionObserver();
            }, 100);
        }
        
        // Remove loading overlay
        loadingOverlay.remove();
        
    } catch (error) {
        console.log('Google Sheets optional - keeping existing destinations content');
        // Keep existing content if Google Sheets fails
        hideDestinationsLoadingIndicator();
    }
}

// Parse CSV data for destinations
function parseDestinationsCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const item = {};
        
        headers.forEach((header, index) => {
            // Handle empty values
            item[header] = values[index] !== undefined ? values[index].trim() : '';
        });
        
        // Only add if we have a title
        if (item.title && item.title.trim() !== '') {
            // Parse tags - handle multiple formats
            let tags = [];
            if (item.tags) {
                // Try different delimiters
                if (item.tags.includes(';')) {
                    tags = item.tags.split(';').map(t => t.trim()).filter(t => t);
                } else if (item.tags.includes(',')) {
                    tags = item.tags.split(',').map(t => t.trim()).filter(t => t);
                } else {
                    tags = [item.tags.trim()];
                }
            }
            
            // Parse features - handle multiple formats
            let features = [];
            if (item.features) {
                // Try different delimiters for features
                if (item.features.includes(';')) {
                    features = item.features.split(';').map(f => f.trim()).filter(f => f);
                } else if (item.features.includes(',')) {
                    features = item.features.split(',').map(f => f.trim()).filter(f => f);
                } else {
                    features = [item.features.trim()];
                }
            }
            
            // Get feature icons based on features
            const featureIcons = getDestinationsFeatureIcons(features);
            
            data.push({
                title: item.title,
                image: item.imageurl || item.image_url || item.image || '',
                category: item.category || '',
                rating: parseFloat(item.rating) || 5,
                location: item.location || '',
                tags: tags,
                description: item.description || '',
                features: features,
                featureIcons: featureIcons,
                badge: item.badge || '',
                badge_label: item.badge_label || item.badgelabel || '',
                explore_link: item.explore_link || item.link || '#',
                price_range: item.price_range || '',
                best_time: item.best_time || ''
            });
        }
    }
    
    return data;
}

// Parse CSV line (handles commas in quotes) - Same as accommodations
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"' && inQuotes) {
            inQuotes = false;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values.map(v => v.trim());
}

// Create destination card from data
function createDestinationCardFromData(dest) {
    const card = document.createElement('article');
    card.className = 'dest-card';
    card.dataset.category = dest.category || '';
    card.dataset.rating = dest.rating || '5';
    
    // Generate stars for rating
    const starsHtml = generateDestinationsStars(dest.rating);
    
    // Generate tags HTML
    const tagsHtml = dest.tags && dest.tags.length > 0 
        ? dest.tags.map(tag => `<span class="dest-tag">${tag}</span>`).join('')
        : '';
    
    // Generate features HTML with icons
    let featuresHtml = '';
    if (dest.features && dest.features.length > 0) {
        featuresHtml = dest.features.map((feature, index) => {
            // Get icon for this feature, use default if none found
            const icon = dest.featureIcons && dest.featureIcons[index] 
                ? dest.featureIcons[index] 
                : getDestinationsDefaultFeatureIcon(index);
            
            return `
                <div class="dest-feature">
                    <i class="fas fa-${icon}" aria-hidden="true"></i>
                    <span>${feature}</span>
                </div>
            `;
        }).join('');
    }
    
    // Create card HTML
    card.innerHTML = `
        <div class="dest-card-image">
            <img src="${dest.image || 'images/default-destination.jpg'}" 
                 alt="${dest.title}" 
                 width="400" 
                 height="500"
                 loading="lazy">
            <div class="dest-card-badge ${dest.badge === 'premium' || dest.badge === 'signature' ? 'premium' : ''}">
                <span class="badge-icon"><i class="fas fa-${getDestinationsBadgeIcon(dest.badge)}" aria-hidden="true"></i></span>
                <span>${dest.badge_label || 'Featured'}</span>
            </div>
        </div>
        
        <div class="dest-card-content">
            <div class="dest-card-header">
                <h3 class="dest-card-title">${dest.title}</h3>
                <div class="dest-card-rating" aria-label="Rating: ${dest.rating} out of 5 stars">
                    ${starsHtml}
                </div>
            </div>
            
            <div class="dest-card-tags">
                ${tagsHtml}
            </div>
            
            <p class="dest-card-description">${dest.description || 'A beautiful destination in Sri Lanka.'}</p>
            
            <div class="dest-card-features">
                ${featuresHtml}
            </div>
            
            <div class="dest-card-footer">
                <a href="${dest.explore_link}" class="dest-explore-btn">
                    Explore Experience
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </a>
            </div>
        </div>
    `;
    
    return card;
}

// Helper functions for destinations Google Sheets integration

function getDestinationsBadgeIcon(badgeType) {
    const icons = {
        'premium': 'crown',
        'signature': 'award',
        'featured': 'star',
        'unesco': 'landmark',
        'heritage': 'landmark',
        'cultural': 'landmark',
        'natural': 'tree',
        'adventure': 'mountain',
        'beach': 'umbrella-beach',
        'wildlife': 'paw',
        'wellness': 'spa',
        'romantic': 'heart',
        'family': 'users',
        'luxury': 'gem'
    };
    return icons[badgeType?.toLowerCase()] || 'star';
}

// Smart feature icon detection for destinations
function getDestinationsFeatureIcons(features) {
    if (!features || !Array.isArray(features)) return [];
    
    const iconMap = {
        // Time/Season related
        'best': 'clock',
        'time': 'clock',
        'season': 'clock',
        'sunrise': 'sun',
        'sunset': 'moon',
        'duration': 'clock',
        
        // Audience related
        'couples': 'heart',
        'families': 'users',
        'family': 'users',
        'solo': 'user',
        'group': 'users',
        'friends': 'user-friends',
        
        // Activities
        'walking': 'walking',
        'hiking': 'hiking',
        'trekking': 'mountain',
        'climbing': 'mountain',
        'exploring': 'map',
        'tours': 'map-marked-alt',
        'guided': 'map-signs',
        'photography': 'camera',
        'sightseeing': 'binoculars',
        
        // Experience types
        'adventure': 'hiking',
        'relaxation': 'spa',
        'education': 'graduation-cap',
        'shopping': 'shopping-bag',
        'dining': 'utensils',
        
        // Location types
        'indoors': 'home',
        'outdoors': 'tree',
        'coastal': 'water',
        'mountain': 'mountain',
        'urban': 'city',
        
        // Transport
        'car': 'car',
        'transport': 'car',
        'walking distance': 'walking',
        
        // Default fallbacks
        'historic': 'landmark',
        'cultural': 'landmark',
        'scenic': 'eye',
        'exclusive': 'crown',
        'luxury': 'gem'
    };
    
    return features.map(feature => {
        const lowerFeature = feature.toLowerCase();
        
        // Check for exact matches first
        if (iconMap[lowerFeature]) {
            return iconMap[lowerFeature];
        }
        
        // Check for partial matches
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerFeature.includes(key) || key.includes(lowerFeature)) {
                return icon;
            }
        }
        
        // Default icons based on common patterns
        if (lowerFeature.includes('time') || lowerFeature.includes('season') || lowerFeature.includes('best')) {
            return 'clock';
        }
        if (lowerFeature.includes('family') || lowerFeature.includes('group') || lowerFeature.includes('people')) {
            return 'users';
        }
        if (lowerFeature.includes('walk') || lowerFeature.includes('hike') || lowerFeature.includes('trek')) {
            return 'walking';
        }
        if (lowerFeature.includes('view') || lowerFeature.includes('scenic')) {
            return 'eye';
        }
        if (lowerFeature.includes('private') || lowerFeature.includes('exclusive')) {
            return 'crown';
        }
        
        return 'check'; // Default fallback
    });
}

function getDestinationsDefaultFeatureIcon(index) {
    const defaultIcons = [
        'clock', 'users', 'walking', 'map-marked-alt', 'sun',
        'moon', 'hiking', 'car', 'binoculars', 'camera',
        'heart', 'spa', 'shopping-bag', 'utensils', 'tree',
        'mountain', 'water', 'city', 'home'
    ];
    return defaultIcons[index] || 'check';
}

function generateDestinationsStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star" aria-hidden="true"></i>';
    }
    
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt" aria-hidden="true"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star" aria-hidden="true"></i>';
    }
    
    return stars;
}

// Helper function to hide loading indicator
function hideDestinationsLoadingIndicator() {
    const loadingOverlay = document.querySelector('.destinations-loading');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}




document.addEventListener('DOMContentLoaded',()=>{

const qs=(s,p=document)=>p.querySelector(s);
const qsa=(s,p=document)=>[...p.querySelectorAll(s)];

/* HERO SLIDER */
const slides=qsa('.dest-hero-slide');
if(slides.length>1 && matchMedia('(prefers-reduced-motion:no-preference)').matches){
let i=0; setInterval(()=>{slides[i].classList.remove('active'); i=(i+1)%slides.length; slides[i].classList.add('active');},5000);
}

/* FILTER */
const cards=qsa('.dest-card');
qsa('.dest-filter-btn').forEach(btn=>{
btn.onclick=()=>{
qsa('.dest-filter-btn').forEach(b=>b.classList.remove('active'));
btn.classList.add('active');
const c=btn.dataset.category;
cards.forEach(card=>{
card.style.display=(c==='all'||card.dataset.category.includes(c))?'block':'none';
});
};
});

/* SEARCH */
const search=qs('#destination-search');
if(search){
search.oninput=()=>{
const v=search.value.toLowerCase();
cards.forEach(c=>{
c.style.display=(c.textContent.toLowerCase().includes(v))?'block':'none';
});
};
}

/* SCROLL */
qs('.dest-scroll-indicator')?.addEventListener('click',()=>{
qs('.dest-filter-section').scrollIntoView({behavior:'smooth'});
});

/* LOAD MORE */
qs('.dest-load-more-btn')?.addEventListener('click',e=>{
e.target.remove();
});

/* NAVBAR */
const burger=qs('.hamburger'), menu=qs('.nav-menu');
burger?.addEventListener('click',()=>{
menu.classList.toggle('active');
burger.classList.toggle('active');
});



/* INTERSECTION ANIMATION */
if('IntersectionObserver'in window){
const obs=new IntersectionObserver(es=>{
es.forEach(e=>e.isIntersecting&&e.target.classList.add('animate-in'));
},{threshold:.1});
cards.forEach(c=>obs.observe(c));
}

/* NAVBAR SCROLL */
const nav=qs('.navbar');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>50));

});




