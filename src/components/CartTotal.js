import React, { useState, useRef, useEffect, useCallback } from 'react';
import GooglePayButton from "@google-pay/button-react";
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useSelector } from 'react-redux';

const CartTotal = (props) => {
    const shippingCost = 30; // تكلفة الشحن بالدرهم
    const taxCost = 20; // الضريبة بالدرهم
    const exchangeRate = 11; // سعر الصرف من الدولار إلى الدرهم

    const cartItems = useSelector((state) => state.cart.items);
    const cartLen = cartItems.length;

    const totalPrice = props.totalPr * exchangeRate;
    const finalPrice = totalPrice + shippingCost + taxCost;

    const [showForm, setShowForm] = useState(false); // حالة ظهور القائمة المنسدلة
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        additionalInfo: '',
    });
    const [showSuccess, setShowSuccess] = useState(false); // حالة ظهور إشعار النجاح
    const formRef = useRef(null); // استخدام useRef للوصول إلى الفورم

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (formRef.current && !formRef.current.contains(e.target)) {
                setShowForm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePaymentOnDelivery = useCallback(() => {
        setShowForm(!showForm); // تبديل حالة ظهور القائمة المنسدلة
    }, [showForm]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (
            formData.firstName &&
            formData.lastName &&
            formData.address &&
            formData.city &&
            formData.phone &&
            formData.email
        ) {
            setShowSuccess(true); // عرض إشعار النجاح
            setTimeout(() => setShowSuccess(false), 3000); // إخفاء الإشعار بعد 3 ثواني
            setShowForm(false); // إخفاء القائمة بعد التأكيد
        } else {
            alert('Please fill in all required fields.'); // رسالة خطأ باللغة الإنجليزية
        }
    }, [formData]);

    return (
        <div className='cartTotalMainParent'>
            <div className='flex flex-row gap-36 font-semibold text-2xl mt-8 mobTextSize gap6rem'>
                <p className='ml-14'>SUBTOTAL</p>
                <p>{Math.round(totalPrice)} MAD</p>
            </div>

            <div className='headingHold mobTextSize2 mt-10 fof flex flex-col gap-12 relative ml-16 mr-4 font-medium text-xl'>
                <p>SHIPPING</p>
                <p>INCL. TAX</p>
            </div>

            <div className='calcHold mobTextSize relative fof flex flex-col gap-12 font-medium text-xl'>
                <p>{shippingCost} MAD</p>
                <p>{taxCost} MAD</p>
            </div>

            <div className='relative totLine'>
                <p className='text-gray-300'>________________________________________________________</p>
            </div>

            <div className='ctActualToatal fof text-xl font-medium relative'>
                <p>TOTAL {Math.round(finalPrice)} MAD</p>
            </div>

            <div className='relative totLine2'>
                <p className='text-gray-300'>________________________________________________________</p>
            </div>

            {/* مربع الدفع */}
            <div className='paymentBox bg-white p-6 rounded-lg shadow-lg mt-6'>
                <div className='paymentButtons flex flex-col gap-4'>
                    {/* زر Google Pay */}
                    <div className='gpayBtnHold'>
                        <GooglePayButton
                            environment='TEST'
                            paymentRequest={{
                                apiVersion: 2,
                                apiVersionMinor: 0,
                                allowedPaymentMethods: [
                                    {
                                        type: "CARD",
                                        parameters: {
                                            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                                            allowedCardNetworks: ["MASTERCARD", "VISA", "AMEX"]
                                        },
                                        tokenizationSpecification: {
                                            type: "PAYMENT_GATEWAY",
                                            parameters: {
                                                gateway: "example",
                                                gatewayMerchantId: "exampleGatewayMerchantId",
                                            },
                                        },
                                    },
                                ],
                                merchantInfo: {
                                    merchantId: "17613812255336763067",
                                    merchantName: "Demo Only"
                                },
                                transactionInfo: {
                                    totalPriceStatus: 'FINAL',
                                    totalPriceLabel: "Total",
                                    totalPrice: finalPrice.toString(),
                                    currencyCode: "MAD",
                                    countryCode: "MA",
                                },
                            }}
                            onLoadPaymentData={paymentData => {
                                console.log(paymentData.paymentMethodData);
                            }}
                            style={{ width: '100%', height: '40px' }} // جعل الزر أصغر
                        />
                    </div>

                    {/* زر PayPal */}
                    <div className='paypalHold'>
                        <PayPalScriptProvider options={{ "client-id": "YOUR_PAYPAL_CLIENT_ID" }}>
                            <PayPalButtons
                                aria-label='BUY WITH PAYPAL'
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [
                                            {
                                                amount: {
                                                    value: (finalPrice / exchangeRate).toFixed(2), // تحويل المبلغ إلى دولار
                                                },
                                            },
                                        ],
                                    });
                                }}
                            />
                        </PayPalScriptProvider>
                    </div>

                    {/* زر الدفع بعد الاستلام */}
                    <div className='paymentOnDeliveryHold'>
                        <button
                            className={`paymentOnDeliveryBtn bg-blue-500 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors`}
                            onClick={handlePaymentOnDelivery}
                        >
                            <span>Payment on Delivery</span>
                            <i className='fas fa-truck'></i> {/* أيقونة الشاحنة */}
                        </button>
                    </div>
                </div>
            </div>

            {/* القائمة المنسدلة */}
            {showForm && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <div
                        className='paymentOnDeliveryForm bg-white p-6 rounded-lg shadow-lg w-full max-w-md transform transition-transform duration-300 ease-in-out'
                        ref={formRef}
                    >
                        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                            <input
                                type='text'
                                name='firstName'
                                placeholder='First Name'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type='text'
                                name='lastName'
                                placeholder='Last Name'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type='text'
                                name='address'
                                placeholder='Address'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type='text'
                                name='city'
                                placeholder='City'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type='text'
                                name='phone'
                                placeholder='Phone Number'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type='email'
                                name='email'
                                placeholder='Email'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <textarea
                                name='additionalInfo'
                                placeholder='Additional Information'
                                className='p-2 rounded border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                                value={formData.additionalInfo}
                                onChange={handleInputChange}
                            />
                            <button
                                type='submit'
                                className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors'
                            >
                                Confirm
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* إشعار النجاح */}
            {showSuccess && (
                <div className='fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg'>
                    Order confirmed successfully!
                </div>
            )}
        </div>
    );
};

export default CartTotal;