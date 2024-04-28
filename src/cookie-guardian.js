// Copyright Christopher Nathaniel 2024-present
// Full license can be found in the LICENSE file

import './cookie-guardian.scss';

// Remove Script by Source
const removeScriptsBySource = (sourceSubstring) => {
    let scripts = document.querySelectorAll('script[src*="' + sourceSubstring + '"]');
    scripts.forEach(function(script) {
        script.parentNode.removeChild(script);
    });
}

// ALL External Scripts
const removeExternalScripts = () => {
    let currentDomain = window.location.hostname;
    let scripts = document.querySelectorAll('script[src]');
    scripts.forEach(function(script) {
        var scriptDomain = new URL(script.src).hostname;
        if (scriptDomain !== currentDomain) {
            script.parentNode.removeChild(script);
        }
    });
}


// Render HTML element that is replacable
const toHTML = (htmlString, targetId, parentElement = document.body) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString.trim();
    const htmlElement = tempElement.firstChild;
    const targetElement = parentElement.querySelector(`[data-uuid="${targetId}"]`);
    tempElement.childNodes[0].dataset.uuid = targetId;
    if (targetElement) {
        return targetElement.parentNode.replaceChild(htmlElement, targetElement);
    } else {
        return parentElement.appendChild(htmlElement);
    }
}
 


// CookieGuardian({
//     policyLink: '/cookie-policy',
//     stopAllCookies: true,
//     desc: `<p>This website uses cookies...</a></p>`,
//     unclassifiedText: 'Unclassified cookies are cookies...',
//     marketingText: 'Marketing cookies are used...',
//     statisticsText: 'Statistical cookies help...',
//     preferencesText: 'Preference cookies enable...',
//     requiredText: 'Required cookies help...',
//     acceptText: 'Accept All',
//     declineText: 'Deny',
//     preferences: () => {
//         // Preferences Callback
//     },
//     statistics: () => {
//         // Statistics Callback
//     },
//     marketing: () => {
//         // Marketing Callback
//     },
//     unclassified: () => {
//         // Unclassified Callback
//     }
// });

// Main Cookie Guardian Scripts
class CookieGuardian {

    constructor(obj) {
        this.policyLink = obj?.policyLink ?? '/cookie-policy';
        this.open = this.getLocalStorage('cookie-guardian') ?? true;
        this.required = this.getLocalStorage('cookie-guardian-required') ?? false;
        this.preferences = this.getLocalStorage('cookie-guardian-preferences') ?? false;
        this.statistics = this.getLocalStorage('cookie-guardian-statistics') ?? false;
        this.marketing =  this.getLocalStorage('cookie-guardian-marketing') ?? false;
        this.unclassified = this.getLocalStorage('cookie-guardian-unclassified') ?? false;
        this.banner = null;
        this.stopAllCookies = obj?.stopAllCookies ?? true;
        this.desc = obj?.desc ?? `<p>This website uses cookies to improve user experience. By continuing to use this website, you consent to our use of cookies in accordance with our <a href="${this.policyLink}">Cookie Policy.</a></p>
        <p>Cookies are small text files that are placed on your machine to help the site provide a better user experience. In general, cookies are used to retain user preferences, store information for things like shopping carts, and provide anonymized tracking data to third-party applications like Google Analytics. As a rule, cookies will make your browsing experience better. However, you may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your browser. We suggest consulting the Help section of your browser or taking a look at the About Cookies website which offers guidance for all modern browsers.</p>
        <p>By using this website, you agree to the use of cookies as described above.</p>`;

        this.unclassifiedText = obj?.unclassifiedText ?? 'Unclassified cookies are cookies that we are in the process of classifying, together with the providers of individual cookies.';
        this.marketingText = obj?.marketingText ?? 'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.';
        this.statisticsText = obj?.statisticsText ?? 'Statistical cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.';
        this.preferencesText = obj?.preferencesText ?? 'Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.';
        this.requiredText = obj?.requiredText ?? 'Required cookies help make a website usable by enabling basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.';

        this.preferencesCallback = obj?.preferences ?? (() => {});
        this.statisticsCallback = obj?.statistics ?? (() => {});
        this.marketingCallback = obj?.marketing ?? (() => {});
        this.unclassifiedCallback = obj?.unclassified ?? (() => {});

        this.acceptText = obj?.acceptText ?? 'Accept All';
        this.declineText = obj?.declineText ?? 'Deny';

        let button = this.cookieButtonHTML();
        
        button.addEventListener('click', () => {
            this.open = !this.open;
            this.render();
        });

        this.render();
        this.runCallbacks();
        this.runInterval();
    }


    render () {
        
        if(this.open) {
            this.banner = this.cookieBannerHTML();
            this.banner.classList.add('cookie-guardian__active');
        }
        
        if(!this.open) {
            if(this.banner) {
                this.banner.remove();
            }

            return;
        }

        this.banner.querySelector('.cookie-guardian__close').addEventListener('click', () => {
            this.open = false;

            
            this.setLocalStorage('cookie-guardian', this.open);
            this.setLocalStorage('cookie-guardian-preferences', this.preferences);
            this.setLocalStorage('cookie-guardian-statistics', this.statistics);
            this.setLocalStorage('cookie-guardian-marketing', this.marketing);
            this.setLocalStorage('cookie-guardian-unclassified', this.unclassified);

            this.render();
        });

        this.banner.querySelector('#cookie-guardian__deny-button').addEventListener('click', () => {
            this.open = false;

            this.preferences = false;
            this.statistics = false;
            this.marketing = false;
            this.unclassified = false;
            
            this.setLocalStorage('cookie-guardian', this.open);
            this.setLocalStorage('cookie-guardian-preferences', this.preferences);
            this.setLocalStorage('cookie-guardian-statistics', this.statistics);
            this.setLocalStorage('cookie-guardian-marketing', this.marketing);
            this.setLocalStorage('cookie-guardian-unclassified', this.unclassified);
            this.render();
        });

        this.banner.querySelector('#cookie-guardian__accept-button').addEventListener('click', () => {
            this.open = false;
            this.preferences = true;
            this.statistics = true;
            this.marketing = true;
            this.unclassified = true;
            
            this.setLocalStorage('cookie-guardian', this.open);
            this.setLocalStorage('cookie-guardian-preferences', this.preferences);
            this.setLocalStorage('cookie-guardian-statistics', this.statistics);
            this.setLocalStorage('cookie-guardian-marketing', this.marketing);
            this.setLocalStorage('cookie-guardian-unclassified', this.unclassified);
            this.runCallbacks();
            this.render();
        });

        this.banner.querySelector('.cg--statistics').checked = this.statistics;
        this.banner.querySelector('.cg--marketing').checked = this.marketing;
        this.banner.querySelector('.cg--unclassified').checked = this.unclassified;
        this.banner.querySelector('.cg--preferences').checked = this.preferences;

        this.banner.querySelector('.cg--preferences').addEventListener('click', (item) => {
            this.preferences = item.target.checked;
            this.setLocalStorage('cookie-guardian-preferences', this.preferences);
        });

        this.banner.querySelector('.cg--statistics').addEventListener('click', (item) => {
            this.statistics = item.target.checked;
            this.setLocalStorage('cookie-guardian-statistics', this.statistics);
        });

        this.banner.querySelector('.cg--marketing').addEventListener('click', (item) => {
            this.marketing = item.target.checked;
            this.setLocalStorage('cookie-guardian-marketing', this.marketing);
        });

        this.banner.querySelector('.cg--unclassified').addEventListener('click', (item) => {
            this.unclassified = item.target.checked;
            this.setLocalStorage('cookie-guardian-unclassified', this.unclassified);
        });
    }

    runCallbacks () {
         // All Cookies Accepted, run all callbacks
         if(this.preferences) {
             this.preferencesCallback();
         }
         if(this.statistics) {
             this.statisticsCallback();
         }
        if(this.marketing) {
            this.marketingCallback();
        }
        if(this.unclassified) {
            this.unclassifiedCallback();
        }
    }

    // Set a value in local storage
    setLocalStorage (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Get a value from local storage
    getLocalStorage (key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // Remove a value from local storage
    removeLocalStorage (key)  {
        localStorage.removeItem(key);
    }

    // Remove all cookies
    removeAllCookies () {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            const cookieParts = cookie.split('=');
            const name = cookieParts.shift();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    }

    cookieBannerHTML () {
        return toHTML(`<div>
            <div class="cookie-guardian">
                <div class="cookie-guardian__close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg></div>
                    <div class="cookie-guardian__content" data-tabcg="1">
                        <div class="cookie-guardian__banner">
                            <div>Cookie Guardian</div>
                            <span>BY CHRISTOPHER NATHANIEL</span>
                        </div>
                        <div class="cookie-guardian__desc">
                           ${ this.desc }
                        </div>
                     
                       
                            <div class="cookie-guardian__options">
                            <div class="cookie-guardian__section">
                                <b>Required</b>
                                <p>${ this.requiredText }</p>
                                <input type="checkbox" checked="checked" disabled="disabled" />  
                                <div class="checkbox-slider"></div>  
                            </div>

                            <div class="cookie-guardian__section">
                                <b>Preferences</b>
                                <p>${ this.preferencesText }</p>
                                <input type="checkbox" class="cg--preferences" />  
                                <div class="checkbox-slider"></div>  
                            </div>

                            <div class="cookie-guardian__section">
                                <b>Statistics</b>
                                <p>${ this.statisticsText }</p>
                                <input type="checkbox" class="cg--statistics" />  
                                <div class="checkbox-slider"></div>  
                            </div>

                            <div class="cookie-guardian__section">
                                <b>Marketing</b>
                                <p>${ this.marketingText }</p>
                                <input type="checkbox" class="cg--marketing" />  
                                <div class="checkbox-slider"></div>  
                            </div>
                
                            <div class="cookie-guardian__section">
                                <b>Unclassified</b>
                                <p>${ this.unclassifiedText }</p>
                                <input type="checkbox" class="cg--unclassified" />  
                                <div class="checkbox-slider"></div>  
                            </div>
                        </div>

                        <div class="cookie-guardian__buttons">
                            <button id="cookie-guardian__deny-button" class="cookie-guardian__button">${ this.declineText }</button>
                            <button id="cookie-guardian__accept-button" class="cookie-guardian__button">${ this.acceptText }</button>
                        </div>

                       
                
                </div>
            </div>
            <div class="cookie-guardian__overlay">

            </div>
        </div>`, 1);
    }
    cookieButtonHTML () {
        return toHTML(`<div>
            <div class="cookie-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M247.2 17c-22.1-3.1-44.6 .9-64.4 11.4l-74 39.5C89.1 78.4 73.2 94.9 63.4 115L26.7 190.6c-9.8 20.1-13 42.9-9.1 64.9l14.5 82.8c3.9 22.1 14.6 42.3 30.7 57.9l60.3 58.4c16.1 15.6 36.6 25.6 58.7 28.7l83 11.7c22.1 3.1 44.6-.9 64.4-11.4l74-39.5c19.7-10.5 35.6-27 45.4-47.2l36.7-75.5c9.8-20.1 13-42.9 9.1-64.9l-14.6-82.8c-3.9-22.1-14.6-42.3-30.7-57.9L388.9 57.5c-16.1-15.6-36.6-25.6-58.7-28.7L247.2 17zM208 144a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM144 336a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm224-64a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
            </div>
        </div>`, 2);
    }

    runInterval () {
        // Check every 30 seconds if decline option is selected and remove all cookies
        setInterval(() => {
            let isAccepted = this.getLocalStorage('cookie-guardian-marketing') ?? false;
            if (!isAccepted) {
        
                if(this.stopAllCookies === true) {
                    // Script to try an disable as many external scripts as possible
                    // This is not a foolproof method
                    this.removeAllCookies();
                    
                    document.querySelectorAll('iframe').forEach(function(iframe) {
                        iframe.parentNode.removeChild(iframe);
                    });
        
                    removeExternalScripts();
        
                    removeScriptsBySource('google-analytics.com');
                    removeScriptsBySource('googletagmanager.com');
                    removeScriptsBySource('facebook.net');
                    removeScriptsBySource('twitter.com');
                    removeScriptsBySource('linkedin.com');
                    removeScriptsBySource('hotjar.com');
                    removeScriptsBySource('matomo.org');
                    removeScriptsBySource('crazyegg.com');
                    removeScriptsBySource('mouseflow.com');
                    removeScriptsBySource('vwo.com');
                    removeScriptsBySource('omniture.com');
                    removeScriptsBySource('quantserve.com');
                    removeScriptsBySource('mixpanel.com');
                    removeScriptsBySource('segment.com');
                    removeScriptsBySource('optimizely.com');
                    removeScriptsBySource('fullstory.com');
                    removeScriptsBySource('heapanalytics.com');
                    removeScriptsBySource('adroll.com');
                    removeScriptsBySource('taboola.com');
                    removeScriptsBySource('outbrain.com');
                    removeScriptsBySource('doubleclick.net');
                    removeScriptsBySource('googlesyndication.com');
                    removeScriptsBySource('bing.com');
                    removeScriptsBySource('yahoo.com');
                    removeScriptsBySource('adform.com');
                    removeScriptsBySource('adgear.com');
                    removeScriptsBySource('googleadservices.com');
                    removeScriptsBySource('finteza.com');
                    removeScriptsBySource('mc.yandex.ru');
                    removeScriptsBySource('hubspot.com');
                    removeScriptsBySource('pardot.com');
                    removeScriptsBySource('leadfeeder.com');
                }
            }
        }, 30000);
    }


};



if (typeof module === 'object' && typeof module.exports === 'object') {
    // Export as CommonJS module
    console.log("Exporting as CommonJS module");
    module.exports = CookieGuardian;
} else {
    // Define global variable in browser environment
    console.log("Defining as global variable in browser environment");
    window.CookieGuardian = CookieGuardian;
}


export default CookieGuardian;

// Usage:

// <script src="cookie-guardian/src/cookie-guardian.js"></script>
// <script>
//       const cookieGuardian = new CookieGuardian();
// </script>
