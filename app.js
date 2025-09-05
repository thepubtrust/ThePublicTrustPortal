// The Public Trust - News Aggregator JavaScript
class PublicTrustApp {
    constructor() {
        this.currentFocus = -1;
        this.focusableElements = [];
        this.init();
    }

    init() {
        this.removeExpiredItems();
        this.setupEventListeners();
        this.highlightRecentArticles();
        this.updateTimestamp();
        this.initStateDropdown();
        this.addDynamicStyles();
        this.rotateFeaturedIfDue();
    }

    setupEventListeners() {
        // External link tracking and security
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            this.secureExternalLink(link);
            link.addEventListener('click', this.handleExternalLink.bind(this));
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleInternalLink.bind(this));
        });

        // Touch effects for mobile
        if ('ontouchstart' in window) {
            this.setupTouchEffects();
        }
    }

    handleExternalLink(e) {
        const link = e.currentTarget;
        const headline = this.sanitizeInput(link.textContent.trim());
        const section = link.closest('section');
        const sectionName = this.sanitizeInput(section?.querySelector('h3, .column-title')?.textContent || 'Unknown');
        
        // Secure analytics tracking
        this.trackSecureEvent('link_click', {
            headline: headline,
            section: sectionName,
            url: link.href,
            external: link.hostname !== window.location.hostname
        });
        
        // Visual feedback
        link.style.opacity = '0.8';
        setTimeout(() => link.style.opacity = '1', 200);
    }

    // Secure event tracking with rate limiting
    trackSecureEvent(eventName, data) {
        const throttledTracking = this.throttleAnalytics((event, eventData) => {
            // Only log to console in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`Event: ${event}`, eventData);
            }
            
            // Send to Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', event, eventData);
            }
        }, 1000);
        
        throttledTracking(eventName, data);
    }

    handleKeyboardNavigation(e) {
        if (this.isTyping(e.target)) return;
        
        const keyActions = {
            'j': () => this.navigateFocus(1),
            'J': () => this.navigateFocus(1),
            'k': () => this.navigateFocus(-1),
            'K': () => this.navigateFocus(-1),
            'h': () => this.goHome(),
            'H': () => this.goHome()
        };

        if (keyActions[e.key]) {
            e.preventDefault();
            keyActions[e.key]();
        }
    }

    isTyping(element) {
        return element.tagName === 'INPUT' || 
               element.tagName === 'TEXTAREA' || 
               element.contentEditable === 'true';
    }

    navigateFocus(direction) {
        if (!this.focusableElements.length) {
            this.focusableElements = Array.from(document.querySelectorAll('a[href], button, input, select, textarea'));
        }
        
        this.currentFocus = Math.max(0, Math.min(
            this.currentFocus + direction, 
            this.focusableElements.length - 1
        ));
        
        this.focusableElements[this.currentFocus]?.focus();
    }

    goHome() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('.site-title')?.focus();
        this.currentFocus = -1;
    }

    handleInternalLink(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setupTouchEffects() {
        const interactiveElements = document.querySelectorAll('.news-item, .links-grid a');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    removeExpiredItems() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        document.querySelectorAll('[data-expires]')?.forEach((element) => {
            const expiresAttr = element.getAttribute('data-expires');
            if (!expiresAttr) return;
            // Interpret as YYYY-MM-DD; expire end of that day local time
            const expiresDate = new Date(expiresAttr + 'T23:59:59');
            if (isNaN(expiresDate.getTime())) return;
            if (new Date() > expiresDate) {
                const removable = element.closest('.news-item') || element;
                removable.parentElement?.removeChild(removable);
            }
        });
    }

    highlightRecentArticles() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        document.querySelectorAll('.news-item').forEach(item => {
            const dateElement = item.querySelector('.date');
            if (!dateElement) return;
            
            const articleDate = this.parseArticleDate(dateElement.textContent.trim());
            if (!articleDate) return;
            
            const timeframe = this.getTimeframe(articleDate, today, yesterday, twoDaysAgo);
            if (timeframe) {
                item.classList.add('recent-article');
            }
        });
    }

    parseArticleDate(dateText) {
        const currentYear = new Date().getFullYear();
        
        // Handle various date formats
        const patterns = [
            { regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/i, format: (matches) => `${matches[1]} ${matches[2]}, ${currentYear}` },
            { regex: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+),\s+(\d{4})/i, format: (matches) => `${matches[1]} ${matches[2]}, ${matches[3]}` },
            { regex: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+),\s+(\d{4})/i, format: (matches) => `${matches[1]} ${matches[2]}, ${matches[3]}` }
        ];
        
        for (const pattern of patterns) {
            const match = dateText.match(pattern.regex);
            if (match) {
                return new Date(pattern.format(match));
            }
        }
        
        return null;
    }

    getTimeframe(articleDate, today, yesterday, twoDaysAgo) {
        if (this.isSameDay(articleDate, today)) return 'Today';
        if (this.isSameDay(articleDate, yesterday)) return 'Yesterday';
        if (articleDate >= twoDaysAgo) return 'Recent';
        return null;
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    addRecentIndicator(item, timeframe) {
        const indicator = document.createElement('span');
        indicator.className = 'recent-indicator';
        indicator.textContent = timeframe;
        
        // Apply styling directly to ensure it works
        indicator.style.cssText = `
            background-color: #FF6600 !important;
            color: #ffffff !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            margin-left: 8px !important;
            display: inline-block !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
        `;
        
        console.log('Created indicator:', indicator.style.cssText);
        
        const headline = item.querySelector('h4');
        headline?.appendChild(indicator);
    }

    updateTimestamp() {
        const element = document.querySelector('.last-updated');
        if (!element) return;
        
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/New_York'
        };
        
        element.textContent = `Last Updated: ${now.toLocaleDateString('en-US', options)} EDT`;
    }

    initStateDropdown() {
        const stateSelect = document.getElementById('stateSelect');
        const stateLinks = document.getElementById('stateLinks');
        
        if (!stateSelect || !stateLinks) return;
        
        stateSelect.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            if (!selectedState) {
                stateLinks.classList.remove('active');
                return;
            }
            
            const stateData = this.stateResources[selectedState];
            if (stateData) {
                this.displayStateLinks(stateData, stateLinks);
            }
        });
    }

    displayStateLinks(stateData, container) {
        const linksHTML = `
            <h4>${stateData.name} Resources</h4>
            <ul>
                ${stateData.links.map(link => 
                    `<li><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></li>`
                ).join('')}
            </ul>
        `;
        
        container.innerHTML = linksHTML;
        container.classList.add('active');
    }

    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .recent-article { border-left: none; background-color: var(--color-bg-1); }
            .recent-indicator { animation: fadeIn 0.5s ease-in; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            a[target="_blank"]::after { content: "↗"; font-size: 0.8em; margin-left: 2px; opacity: 0.6; }
        `;
        document.head.appendChild(style);
    }

    rotateFeaturedIfDue() {
        try {
            const featuredCard = document.querySelector('.featured-card');
            if (!featuredCard) return;
            const rotateOn = featuredCard.getAttribute('data-rotate-on');
            const targetSelector = featuredCard.getAttribute('data-rotate-target-selector');
            if (!rotateOn || !targetSelector) return;
            const rotateDate = new Date(rotateOn + 'T00:00:00');
            if (isNaN(rotateDate.getTime())) return;
            const now = new Date();
            // Rotate on or after the date
            if (now >= rotateDate) {
                const targetArticle = document.querySelector(targetSelector);
                if (!targetArticle) return;

                // Extract content from target article
                const headlineLink = targetArticle.querySelector('h4 a');
                const meta = targetArticle.querySelector('.item-meta');
                if (!headlineLink || !meta) return;

                // Update featured headline and link
                const featuredHeadline = featuredCard.querySelector('.featured-headline a');
                if (featuredHeadline) {
                    featuredHeadline.href = headlineLink.href;
                    featuredHeadline.textContent = headlineLink.textContent.trim();
                }

                // Build summary if present (none in this template)
                const featuredSummary = featuredCard.querySelector('.featured-summary');
                if (featuredSummary) {
                    featuredSummary.textContent = featuredSummary.textContent; // leave as-is if exists
                }

                // Update story-meta: replicate tags while keeping classes
                const storyMeta = featuredCard.querySelector('.story-meta');
                if (storyMeta) {
                    storyMeta.innerHTML = '';
                    const dateEl = meta.querySelector('.date');
                    if (dateEl) {
                        const span = document.createElement('span');
                        span.className = 'date';
                        span.textContent = dateEl.textContent.trim();
                        storyMeta.appendChild(span);
                    }
                    // Copy over recognizable tag chip spans
                    meta.querySelectorAll('span').forEach(s => {
                        const cls = s.className || '';
                        if (cls.includes('tag-') || cls.includes('source') || cls.includes('publication') || cls.includes('author')) {
                            const clone = document.createElement('span');
                            clone.className = cls;
                            clone.textContent = s.textContent.trim();
                            storyMeta.appendChild(clone);
                        }
                    });
                }

                // Remove original article from its column
                const removable = targetArticle.closest('.news-item') || targetArticle;
                removable.parentElement?.removeChild(removable);

                // Prevent repeated rotations
                featuredCard.removeAttribute('data-rotate-on');
                featuredCard.removeAttribute('data-rotate-target-selector');
            }
        } catch (e) {
            // Fail silently on rotate errors to avoid breaking page
        }
    }

    // Security utilities
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/[<>]/g, '');
    }

    // Rate limiting for analytics (prevents abuse)
    throttleAnalytics(callback, delay = 1000) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback.apply(this, args), delay);
        };
    }

    // Secure external link handling
    secureExternalLink(link) {
        if (link.hostname !== window.location.hostname) {
            link.setAttribute('rel', 'noopener noreferrer');
            // Add visual indicator for external links
            link.classList.add('external-link');
        }
    }

    // State resources data
    stateResources = {
        alabama: { name: "Alabama", links: [{ name: "Alabama Fish & Wildlife", url: "https://www.outdooralabama.com/" }, { name: "Alabama State Lands", url: "https://www.alapark.com/" }] },
        alaska: { name: "Alaska", links: [{ name: "Alaska Fish & Game", url: "https://www.adfg.alaska.gov/" }, { name: "Alaska State Lands", url: "https://dnr.alaska.gov/parks/" }] },
        arizona: { name: "Arizona", links: [{ name: "Arizona Game & Fish", url: "https://www.azgfd.com/" }, { name: "Arizona State Lands", url: "https://azstateparks.com/" }] },
        arkansas: { name: "Arkansas", links: [{ name: "Arkansas Game & Fish", url: "https://www.agfc.com/" }, { name: "Arkansas State Lands", url: "https://www.arkansasstateparks.com/" }] },
        california: { name: "California", links: [{ name: "California Fish & Wildlife", url: "https://wildlife.ca.gov/" }, { name: "California State Lands", url: "https://www.parks.ca.gov/" }] },
        colorado: { name: "Colorado", links: [{ name: "Colorado Fish and Wildlife and Public Lands", url: "https://cpw.state.co.us/" }] },
        connecticut: { name: "Connecticut", links: [{ name: "Connecticut Fish and Wildlife and Public Lands", url: "https://portal.ct.gov/DEEP/State-Parks" }] },
        delaware: { name: "Delaware", links: [{ name: "Delaware Fish & Wildlife", url: "https://dnrec.delaware.gov/" }, { name: "Delaware State Lands", url: "https://destateparks.com/" }] },
        florida: { name: "Florida", links: [{ name: "Florida Fish & Wildlife", url: "https://myfwc.com/" }, { name: "Florida State Lands", url: "https://www.floridastateparks.org/" }] },
        georgia: { name: "Georgia", links: [{ name: "Georgia Fish & Wildlife", url: "https://georgiawildlife.com/" }, { name: "Georgia State Lands", url: "https://gastateparks.org/" }] },
        hawaii: { name: "Hawaii", links: [{ name: "Hawaii Fish & Wildlife", url: "https://dlnr.hawaii.gov/dofaw/" }, { name: "Hawaii State Lands", url: "https://dlnr.hawaii.gov/dsp/" }] },
        idaho: { name: "Idaho", links: [{ name: "Idaho Fish & Game", url: "https://idfg.idaho.gov/" }, { name: "Idaho State Lands", url: "https://parksandrecreation.idaho.gov/" }] },
        illinois: { name: "Illinois", links: [{ name: "Illinois Fish and Wildlife and Public Lands", url: "https://dnr.illinois.gov/" }] },
        indiana: { name: "Indiana", links: [{ name: "Indiana Fish & Wildlife", url: "https://www.in.gov/dnr/fish-and-wildlife/" }, { name: "Indiana State Lands", url: "https://www.in.gov/dnr/state-parks/" }] },
        iowa: { name: "Iowa", links: [{ name: "Iowa Fish & Wildlife", url: "https://www.iowadnr.gov/Hunting" }, { name: "Iowa State Lands", url: "https://www.iowadnr.gov/Places-to-Go/State-Parks" }] },
        kansas: { name: "Kansas", links: [{ name: "Kansas Fish & Wildlife", url: "https://ksoutdoors.com/" }, { name: "Kansas State Lands", url: "https://ksoutdoors.com/State-Parks" }] },
        kentucky: { name: "Kentucky", links: [{ name: "Kentucky Fish & Wildlife", url: "https://fw.ky.gov/" }, { name: "Kentucky State Lands", url: "https://parks.ky.gov/" }] },
        louisiana: { name: "Louisiana", links: [{ name: "Louisiana Fish & Wildlife", url: "https://www.wlf.louisiana.gov/" }, { name: "Louisiana State Lands", url: "https://www.lastateparks.com/" }] },
        maine: { name: "Maine", links: [{ name: "Maine Fish & Wildlife", url: "https://www.maine.gov/ifw/" }, { name: "Maine State Lands", url: "https://www.maine.gov/dacf/parks/" }] },
        maryland: { name: "Maryland", links: [{ name: "Maryland Fish & Wildlife", url: "https://dnr.maryland.gov/wildlife/" }, { name: "Maryland State Lands", url: "https://dnr.maryland.gov/publiclands/" }] },
        massachusetts: { name: "Massachusetts", links: [{ name: "Massachusetts Fish & Wildlife", url: "https://www.mass.gov/orgs/division-of-fisheries-and-wildlife" }, { name: "Massachusetts State Lands", url: "https://www.mass.gov/orgs/department-of-conservation-recreation" }] },
        michigan: { name: "Michigan", links: [{ name: "Michigan Fish & Wildlife", url: "https://www.michigan.gov/dnr" }, { name: "Michigan State Lands", url: "https://www.michigan.gov/dnr/places/state-parks" }] },
        minnesota: { name: "Minnesota", links: [{ name: "Minnesota Fish & Wildlife", url: "https://www.dnr.state.mn.us/" }, { name: "Minnesota State Lands", url: "https://www.dnr.state.mn.us/state_parks/index.html" }] },
        mississippi: { name: "Mississippi", links: [{ name: "Mississippi Fish & Wildlife", url: "https://www.mdwfp.com/" }, { name: "Mississippi State Lands", url: "https://www.mdwfp.com/parks-destinations/" }] },
        missouri: { name: "Missouri", links: [{ name: "Missouri Fish & Wildlife", url: "https://mdc.mo.gov/" }, { name: "Missouri State Lands", url: "https://mostateparks.com/" }] },
        montana: { name: "Montana", links: [{ name: "Montana Fish & Wildlife", url: "https://fwp.mt.gov/" }, { name: "Montana State Lands", url: "https://stateparks.mt.gov/" }] },
        nebraska: { name: "Nebraska", links: [{ name: "Nebraska Fish & Wildlife", url: "https://outdoornebraska.gov/" }, { name: "Nebraska State Lands", url: "https://outdoornebraska.gov/stateparks/" }] },
        nevada: { name: "Nevada", links: [{ name: "Nevada Fish & Wildlife", url: "https://www.ndow.org/" }, { name: "Nevada State Lands", url: "https://parks.nv.gov/" }] },
        "new-hampshire": { name: "New Hampshire", links: [{ name: "New Hampshire Fish & Game", url: "https://www.wildlife.nh.gov/" }, { name: "New Hampshire State Lands", url: "https://www.nhstateparks.org/" }] },
        "new-jersey": { name: "New Jersey", links: [{ name: "New Jersey Fish & Wildlife", url: "https://www.nj.gov/dep/fgw/" }, { name: "New Jersey State Lands", url: "https://www.nj.gov/dep/parksandforests/" }] },
        "new-mexico": { name: "New Mexico", links: [{ name: "New Mexico Fish & Game", url: "https://wildlife.dgf.nm.gov/" }, { name: "New Mexico State Lands", url: "https://www.emnrd.nm.gov/spd/" }] },
        "new-york": { name: "New York", links: [{ name: "New York Fish and Wildlife and Public Lands", url: "https://dec.ny.gov/" }] },
        "north-carolina": { name: "North Carolina", links: [{ name: "North Carolina Fish & Wildlife", url: "https://www.ncwildlife.org/" }, { name: "North Carolina State Lands", url: "https://www.ncparks.gov/" }] },
        "north-dakota": { name: "North Dakota", links: [{ name: "North Dakota Fish & Wildlife", url: "https://gf.nd.gov/" }, { name: "North Dakota State Lands", url: "https://www.parkrec.nd.gov/" }] },
        ohio: { name: "Ohio", links: [{ name: "Ohio Fish & Wildlife", url: "https://ohiodnr.gov/wps/portal/gov/odnr/wildlife" }, { name: "Ohio State Lands", url: "https://ohiodnr.gov/discover-and-learn/safety-conservation/about-ODNR/division-parks-watercraft/explore-ohio-state-parks" }] },
        oklahoma: { name: "Oklahoma", links: [{ name: "Oklahoma Fish & Wildlife", url: "https://www.wildlifedepartment.com/" }, { name: "Oklahoma State Lands", url: "https://www.travelok.com/state-parks" }] },
        oregon: { name: "Oregon", links: [{ name: "Oregon Fish & Wildlife", url: "https://myodfw.com/" }, { name: "Oregon State Lands", url: "https://stateparks.oregon.gov/" }] },
        pennsylvania: { name: "Pennsylvania", links: [{ name: "Pennsylvania Fish & Wildlife", url: "https://www.pa.gov/agencies/pgc" }, { name: "Pennsylvania State Lands", url: "https://www.pa.gov/agencies/dcnr/recreation/where-to-go" }] },
        "rhode-island": { name: "Rhode Island", links: [{ name: "Rhode Island Fish & Wildlife", url: "https://dem.ri.gov/programs/fish-wildlife" }, { name: "Rhode Island State Lands", url: "https://riparks.com/" }] },
        "south-carolina": { name: "South Carolina", links: [{ name: "South Carolina Fish & Wildlife", url: "https://www.dnr.sc.gov/" }, { name: "South Carolina State Lands", url: "https://southcarolinaparks.com/" }] },
        "south-dakota": { name: "South Dakota", links: [{ name: "South Dakota Fish & Wildlife", url: "https://gfp.sd.gov/" }, { name: "South Dakota State Lands", url: "https://gfp.sd.gov/parks/" }] },
        tennessee: { name: "Tennessee", links: [{ name: "Tennessee Fish & Wildlife", url: "https://www.tn.gov/twra.html" }, { name: "Tennessee State Lands", url: "https://tnstateparks.com/" }] },
        texas: { name: "Texas", links: [{ name: "Texas Fish & Wildlife", url: "https://tpwd.texas.gov/" }, { name: "Texas State Lands", url: "https://tpwd.texas.gov/state-parks/" }] },
        utah: { name: "Utah", links: [{ name: "Utah Fish & Wildlife", url: "https://wildlife.utah.gov/" }, { name: "Utah State Lands", url: "https://stateparks.utah.gov/" }] },
        vermont: { name: "Vermont", links: [{ name: "Vermont Fish & Wildlife", url: "https://vtfishandwildlife.com/" }, { name: "Vermont State Lands", url: "https://vtstateparks.com/" }] },
        virginia: { name: "Virginia", links: [{ name: "Virginia Fish & Wildlife", url: "https://dwr.virginia.gov/" }, { name: "Virginia State Lands", url: "https://www.dcr.virginia.gov/state-parks/" }] },
        washington: { name: "Washington", links: [{ name: "Washington Fish & Wildlife", url: "https://wdfw.wa.gov/" }, { name: "Washington State Lands", url: "https://parks.state.wa.us/" }] },
        "west-virginia": { name: "West Virginia", links: [{ name: "West Virginia Fish & Wildlife", url: "https://wvdnr.gov/" }, { name: "West Virginia State Lands", url: "https://wvstateparks.com/" }] },
        wisconsin: { name: "Wisconsin", links: [{ name: "Wisconsin Fish & Wildlife", url: "https://dnr.wisconsin.gov/topic/WildlifeHabitat" }, { name: "Wisconsin State Lands", url: "https://dnr.wisconsin.gov/topic/parks" }] },
        wyoming: { name: "Wyoming", links: [{ name: "Wyoming Fish & Wildlife", url: "https://wgfd.wyo.gov/" }, { name: "Wyoming State Lands", url: "https://wyoparks.wyo.gov/" }] }
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PublicTrustApp();
});

// Analytics tracking
window.addEventListener('load', () => {
    // Send page view to Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
    
    console.log('Page view tracked:', {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
});