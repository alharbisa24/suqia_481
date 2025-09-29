'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import Navbar from "../navbar";

export default function DonationPage() {
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(20);

  const [ProductsData, setProductsData] = useState([]); 
  const [totalPrice, setTotalPrice] = useState(0);

  const [formData, setFormData] = useState({
    company: '',
  });

  const [locationForm, setlocationForm] = useState({
    mosque: '',
  });

  const [availableSizes, setAvailableSizes] = useState([]);

  const [search, setSearch]= useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const [mapData, setmapData] = useState({
    city: '',
    district: '',
    street: '',
    latitude: null,
    longitude: null,
  });

  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      router.push("/login");
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.API_URL}/available_products`);
        const data = response.data.map(c => ({ ...c, quantity: 0 }));

        setProductsData(data); 
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    fetchProducts();
  
  }, []);

  const uniqueCompanies = [...new Set(ProductsData.map(product => product.company))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'company') {

      const companySizes = ProductsData
        .filter(product => product.company === value)
        .map(product => product.size);
      
      
      setAvailableSizes(companySizes);
      setSelectedSize('');
      setMaxQuantity(0);
      setQuantity(1);
      setTotalPrice(0);
    }
  };
  useEffect(() => {
    if (selectedSize && formData.company) {
      const selectedProduct = ProductsData.find(
        product => product.company === formData.company && product.size === selectedSize
      );
      
      if (selectedProduct) {
        setMaxQuantity(parseInt(selectedProduct.remaining_quantity));
        setQuantity(1);
        setTotalPrice(parseInt(selectedProduct.price));
      }
    }
  }, [selectedSize, formData.company, ProductsData]);
  
  useEffect(() => {
    if (selectedSize && formData.company) {
      const selectedProduct = ProductsData.find(
        product => product.company === formData.company && product.size === selectedSize
      );
      
      if (selectedProduct) {
        setTotalPrice(quantity * parseInt(selectedProduct.price));
      }
    }
  }, [quantity, selectedSize, formData.company, ProductsData]);
  
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };
  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if(!selectedSize){
        alert('الرجاء اختيار الحجم');
        return
      }
      setStep(2);
    } else if (step === 2) {
      if (!locationForm.mosque || locationForm.mosque.trim() === '') {
        alert('الرجاء إدخال اسم المسجد أو المكان');
        return;
      }
      
      if (!mapData.latitude || !mapData.longitude) {
        alert('الرجاء تحديد الموقع على الخريطة');
        return;
      }
      
      setStep(3);
    }
  };


  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 24.7136, lng: 46.6753 }); 
  const [markerPosition, setMarkerPosition] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const apiUrl = `${process.env.API_URL}/pay`;
     
      const finalPrice = totalPrice + 10;

      const response = await axios.post(apiUrl, {
        ...mapData,
        ...formData,
        ...locationForm,
        selectedSize,
        quantity,
        totalPrice:finalPrice,
        email: user.email,
      });

      if (response.status === 200) {
        const { redirect_url } = response.data;
        router.push(redirect_url);
      } else {
        console.error(response.data);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API,
    libraries: ['places'],
  });

  const [geocoder, setGeocoder] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      setGeocoder(new window.google.maps.Geocoder());
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      
      // Crear un elemento div temporal para el servicio Places
      const mapDiv = document.createElement('div');
      const tempMap = new window.google.maps.Map(mapDiv);
      setPlacesService(new window.google.maps.places.PlacesService(tempMap));
    }
  }, [isLoaded]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (value.length < 2 || !autocompleteService) {
      setPredictions([]);
      return;
    }
    
    autocompleteService.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'SA' }, 
        types: ['establishment', 'geocode'], 
        language: 'ar' 
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handleSelectPrediction = (prediction) => {
    setSearch(prediction.description);
    setPredictions([]);
    
    if (placesService) {
      placesService.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['name', 'geometry', 'address_components', 'formatted_address']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            
            setMapCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
            
            const addressComponents = place.address_components;
            
            let city = "";
            let district = "";
            let street = "";
            let neighborhood = "";
              
            for (const component of addressComponents) {
              if (component.types.includes("locality")) {
                city = component.long_name;
              }
                
              if (component.types.includes("sublocality") || 
                  component.types.includes("sublocality_level_1")) {
                neighborhood = component.long_name;
              }
                
              if (component.types.includes("administrative_area_level_2")) {
                district = component.long_name;
              }
                
              if (component.types.includes("route")) {
                street = component.long_name;
              }
            }
            
            const finalDistrict = neighborhood || district || "";
            const finalStreet = street || "";
            
            setmapData(prev => ({
              ...prev,
              city: city || "غير معروف",
              district: finalDistrict || "غير معروف",
              street: finalStreet || "غير معروف",
              latitude: lat,
              longitude: lng,
            }));
            
            setlocationForm(prev => ({
              ...prev,
              mosque: place.name || prediction.structured_formatting?.main_text || prediction.description.split(',')[0]
            }));
          }
        }
      );
    }
  };

  // Función para manejar clic en el mapa
  const handleMapClick = (event) => {
    if (event && event.latLng) {
      const latLng = event.latLng;
      const lat = latLng.lat();
      const lng = latLng.lng();
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
      setmapData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      if (geocoder) {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const addressComponents = results[0].address_components;
          
            let city = "";
            let district = "";
            let street = "";
            let neighborhood = "";
            
            // Extraer información de dirección
            for (const component of addressComponents) {
              if (component.types.includes("locality")) {
                city = component.long_name;
              }
              
              if (component.types.includes("sublocality") || 
                  component.types.includes("sublocality_level_1")) {
                neighborhood = component.long_name;
              }
              
              if (component.types.includes("administrative_area_level_2")) {
                district = component.long_name;
              }
              
              if (component.types.includes("route")) {
                street = component.long_name;
              }
            }
            
            const finalDistrict = neighborhood || district || "";
            const finalStreet = street || "";
            
            setmapData(prev => ({
              ...prev,
              city: city || "غير معروف",
              district: finalDistrict || "غير معروف",
              street: finalStreet || "غير معروف",
            }));
          }
        });
      }
    }
  };

  const findMosqueOnMap = () => {
    if (!search) return;
    
    // Si hay predicciones, usar la primera
    if (predictions.length > 0) {
      handleSelectPrediction(predictions[0]);
      return;
    }
    
    // Si no hay predicciones, usar la búsqueda normal
    if (geocoder) {
      geocoder.geocode({
        address: search,
        componentRestrictions: { country: 'SA' }
      }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          setmapData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          const addressComponents = results[0].address_components;
          
          let city = "";
          let district = "";
          let street = "";
          let neighborhood = "";

          // Extraer información de dirección
          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            
            if (component.types.includes("sublocality") || 
                component.types.includes("sublocality_level_1")) {
              neighborhood = component.long_name;
            }
            
            if (component.types.includes("administrative_area_level_2")) {
              district = component.long_name;
            }
            
            if (component.types.includes("route")) {
              street = component.long_name;
            }
          }
          
          const finalDistrict = neighborhood || district || "";
          const finalStreet = street || "";
          
          // Actualizar mapData
          setmapData(prev => ({
            ...prev,
            city: city || "غير معروف",
            district: finalDistrict || "غير معروف",
            street: finalStreet || "غير معروف",
          }));
          
          const placeName = search;
          setlocationForm(prev => ({
            ...prev,
            mosque: placeName
          }));
        }
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  if (loadError) {
    return <div>Error loading maps.</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar/>
      <div className="max-w-3xl mx-auto">
        {/* Indicador de progreso */}
        <div className="mb-10">
          {/* Código del indicador de progreso... */}
          <div className="flex items-center justify-between w-full max-w-lg mx-auto">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'} mb-2`}>
                <span className="font-bold">1</span>
              </div>
              <span className="text-sm font-medium">بيانات الطلب</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'} mx-2`}></div>
            
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'} mb-2`}>
                <span className="font-bold">2</span>
              </div>
              <span className="text-sm font-medium">الموقع</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'} mx-2`}></div>
            
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'} mb-2`}>
                <span className="font-bold">3</span>
              </div>
              <span className="text-sm font-medium">الدفع</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <form onSubmit={handleNextStep} className="space-y-6">
            {step === 1 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 text-right">بيانات الطلب</h2>
                <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">الشركة</label>
        <div className="relative">
          <select
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white text-right text-gray-800 text-base appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            disabled={loading}
          >
            <option value="">اختر الشركة</option>
            {uniqueCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-right">
        <label className="block text-sm font-medium text-gray-700 mb-2">الحجم</label>
        <div className="grid grid-cols-3 gap-4">
          {availableSizes.map((size) => {
 
            
            return (
              <label 
                key={size} 
                className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSize === size ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={size}
                  checked={selectedSize === size}
                  onChange={() => handleSizeChange(size)}
                  className="sr-only"
                  disabled={!formData.company}
                />
                <div className="flex flex-col items-start space-y-1 w-full">
               
                  <span className="text-sm text-gray-500">
                    {size}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="text-right">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الكمية (كرتون)
        </label>
        <div className="flex items-center justify-end border-2 border-gray-200 rounded-lg overflow-hidden w-1/2 mr-auto">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-lg font-medium"
            disabled={!selectedSize}
          >
            -
          </button>
          <span className="flex-1 text-center text-gray-800 font-medium py-3">{quantity}</span>
          <button
            disabled={quantity >= maxQuantity || !selectedSize}
            type="button"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-lg font-medium disabled:opacity-50"
          >
            +
          </button>
        </div>
        {selectedSize && (
          <p className="text-sm text-gray-500 mt-1">الكمية المتاحة: {maxQuantity} كرتون</p>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">الإجمالي</span>
          <div className="flex items-center gap-1 text-2xl font-bold text-gray-800">
            {totalPrice}
            <img
              className="h-5 w-auto inline-block"
              src='images/Saudi_Riyal_Symbol.svg'
              alt="ريال سعودي"
            />
          </div>
        </div>
      </div>
    </div>
  );
              
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="p-8 pb-0">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">تحديد موقع المسجد</h2>
                </div>

                <div className="relative h-[450px] w-full">
                  <GoogleMap
                    center={mapCenter}
                    zoom={14}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    onClick={handleMapClick}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      restriction: {
                        latLngBounds: {
                          north: 32.5,
                          south: 16.0,
                          west: 34.0,
                          east: 56.0
                        },
                        strictBounds: true
                      },
                      mapTypeControl: false,
                      minZoom: 6
                    }}
                  >
                    {markerPosition && <Marker position={markerPosition} />}
                  </GoogleMap>
              
                  {/* Aquí implementamos el nuevo campo de búsqueda con autocompletado */}
                  <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4">
                    <div className="relative" ref={searchRef}>
                      <input
                        type="text"
                        name="search"
                        placeholder="ابحث عن مسجد أو مكان..."
                        value={search}
                        onChange={handleSearchChange}
                        onFocus={() => setIsSearchFocused(true)}
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-lg shadow-lg border-0 text-right text-base focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={findMosqueOnMap}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Lista de sugerencias de autocompletado */}
                      {isSearchFocused && predictions.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {predictions.map((prediction) => (
                            <div
                              key={prediction.place_id}
                              onClick={() => handleSelectPrediction(prediction)}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-right border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-800">
                                {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                              </div>
                              {prediction.structured_formatting?.secondary_text && (
                                <div className="text-sm text-gray-500">
                                  {prediction.structured_formatting.secondary_text}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="max-w-xl mx-auto">
                    <label htmlFor="mosque" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      اسم المسجد / المكان <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="mosque"
                      name="mosque"
                      value={locationForm.mosque || ''}
                      onChange={(e) => setlocationForm({...locationForm, mosque: e.target.value})}
                      className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      placeholder="أدخل اسم المسجد أو المكان"
                      dir="rtl"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500 text-right">
                      أدخل اسم المسجد أو المكان، وحدد الموقع على الخريطة
                    </p>
                  </div>
                </div>
                
                <div className="p-8 pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    انتقال للدفع
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="p-8 pt-2 text-left">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  التالي
                </button>
              </div>
            )}
          </form>

          {step === 3 && (
            /* Código del paso 3... */
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-right">ملخص التبرع</h2>
              
              {/* Resumen del pedido... */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-6 bg-gray-50 border-r-4 border-blue-500">
                  <div className="flex flex-row-reverse justify-between items-center">
                    <div className="text-blue-600 text-lg font-medium">{locationForm.mosque}</div>
                    <div className="text-gray-700 font-medium">المسجد</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{formData.company}</span>
                      <span className="text-gray-700 font-medium">الشركة</span>
                    </div>
                    
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{mapData.city || "غير محدد"}</span>
                      <span className="text-gray-700 font-medium">المدينة</span>
                    </div>
                    
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{selectedSize}</span>
                      <span className="text-gray-700 font-medium">الحجم</span>
                    </div>
                    
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{mapData.district || "غير محدد"}</span>
                      <span className="text-gray-700 font-medium">الحي</span>
                    </div>
                 
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{quantity} كرتون</span>
                      <span className="text-gray-700 font-medium">الكمية</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center">
                      <span className="text-gray-800">{mapData.street || "غير محدد"}</span>
                      <span className="text-gray-700 font-medium">الشارع</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-6 text-right">تفاصيل الدفع</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-row-reverse justify-between items-center py-2">
                      <div className="flex items-center gap-1 text-gray-800 font-medium">
                        {totalPrice}
                        <img className="h-4 w-auto inline-block" src='images/Saudi_Riyal_Symbol.svg' alt="ريال" />
                        <span className="text-gray-500 text-sm mr-1">({selectedSize} × {quantity})</span>
                      </div>
                      <span className="text-gray-700">سعر المنتج</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center py-2">
                      <div className="flex items-center gap-1 text-gray-800 font-medium">
                        8
                        <img className="h-4 w-auto inline-block" src='images/Saudi_Riyal_Symbol.svg' alt="ريال" />
                      </div>
                      <span className="text-gray-700">مبلغ التوصيل</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between items-center py-2">
                      <div className="flex items-center gap-1 text-gray-800 font-medium">
                        2
                        <img className="h-4 w-auto inline-block" src='images/Saudi_Riyal_Symbol.svg' alt="ريال" />
                      </div>
                      <span className="text-gray-700">رسوم الخدمة</span>
                    </div>
                    
                    <div className="border-t border-gray-200 my-4"></div>
                    
                    <div className="flex flex-row-reverse justify-between items-center py-2">
                      <div className="flex items-center gap-1 text-xl font-bold text-blue-600">
                        {totalPrice + 10}
                        <img className="h-5 w-auto inline-block" src='images/Saudi_Riyal_Symbol.svg' alt="ريال" />
                      </div>
                      <span className="text-gray-800 font-medium">الإجمالي</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones de pago */}
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`
                    w-full py-4 rounded-lg text-white text-base font-medium
                    transition-all duration-300 flex items-center justify-center
                    ${loading ? 'bg-gray-400' : 'bg-blue-800 hover:bg-blue-700 shadow-md hover:shadow-lg'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الدفع...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      ادفع الآن 
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePreviousStep}
                  className="w-full py-3 rounded-lg text-gray-700 text-base font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  رجوع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}