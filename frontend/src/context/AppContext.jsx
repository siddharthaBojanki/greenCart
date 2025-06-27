import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { toast } from 'react-hot-toast';
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({children}) =>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({});

    //Fetch seller auth status
    const fetchSeller = async () => {
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if (data.success)
                setIsSeller(true);
            else
                setIsSeller(false);
        } 
        catch (error) {
            setIsSeller(false);
        }
    }

    //Fetch user auth status, user data and cart items
    const fetchUser = async () => {
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if (data.success){
                setUser(data.user);
                setCartItems(data.user.cartItems);
            }
        } 
        catch (error) {
            setUser(null);
        }
    }


    //Fetch all products
    const fetchProducts = async () => {
        try {
            const {data} = await axios.get('/api/product/list');
            if (data.success)
                setProducts(data.products)
            else
                toast.error(data.message)
        } 
        catch (error) {
            toast.error(error.message)
        }
    }

    //Add products to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId])
            cartData[itemId] += 1
        else
            cartData[itemId] = 1
        setCartItems(cartData)
        toast.success("Added to Cart")
    }

    //Update cart item quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("Cart Updated")
    }

    const removeFromCart = (itemId) => {
        const cartData = structuredClone(cartItems);
        if (cartData[itemId]){
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0)
                delete cartData[itemId];
        }
        setCartItems(cartData);
        toast.success("Removed from Cart");
    }

    // Get cart items count
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems)
            totalCount += cartItems[item];
        return totalCount;
    }

    //Get cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            let itemInfo = products.find((product) => product._id === item);
            if (cartItems[item] > 0)
                totalAmount += itemInfo.offerPrice * cartItems[item];
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchUser();
        fetchSeller();
        fetchProducts();
    }, [])

    //Update cart data
    useEffect(() => {
        const updateCart = async () => {
            try {
                const {data} = await axios.post('/api/cart/update', {cartItems});
                if (!data.success)
                    toast.error(data.message);
            } 
            catch (error) {
                toast.error(error.message)
            }
        }
        if(user)
            updateCart();
    },[cartItems])

    const value = {navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, cartItems, setCartItems, addToCart, updateCartItem, removeFromCart, searchQuery, setSearchQuery, getCartCount, getCartAmount, axios, fetchProducts};
    return <AppContext.Provider value = {value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
}