/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Admin from './pages/Admin';
import PageNotFound from './lib/PageNotFound';
import __Layout from './Layout.jsx';
import ProductPageTemplate from './pages/ProductPageTemplate';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

const ContactProductPreview = () => (
    <ProductPageTemplate
        title="Hoodie"
        description="This is a sample product description."
        price={19.99}
        images={["src/assets/hoodie.png", "src/assets/hoodie-hover.png"]}
        features={["Very comfortable", "Made from 100% cotton", "Available in multiple colors"]}
        sizes={["S", "M", "L", "XL", "XXL"]}
    />
);

export const PAGES = {
    "Home": Home,
    "Products": Products,
    "About": About,
    "Admin": Admin,
    "Cart": Cart,
    "Checkout": Checkout,
    "Contact": ContactProductPreview,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};