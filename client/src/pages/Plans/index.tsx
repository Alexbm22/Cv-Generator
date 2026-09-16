import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StripeService } from '../../services/stripe'
import { useAuthStore } from '../../Store';
import { useNavigate } from 'react-router-dom';
import { StripePrice } from '../../interfaces/stripe';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import Button from '../../components/UI/Buttons/Button';
import { ButtonStyles } from '../../constants/CV/buttonStyles';


const PlansPage: React.FC = () => {

  const [selectedPlan, setSelectedPlan] = useState<StripePrice>();
  const navigate = useNavigate();

  const { data: products, error, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => StripeService.getPricing(),
    enabled: useAuthStore.getState().isAuthenticated, // just when the user is authenticated
    retry: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const handleContinue = () => {
    if (!selectedPlan) return;
    const mode = selectedPlan.type === 'recurring' ? 'subscription' : 'payment';
    navigate(`/checkout/${selectedPlan.lookup_key}?mode=${mode}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-red-500 font-medium">Something went wrong while loading the plans.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-12">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">
        <h1 className="font-serif text-4xl text-[#00409f]">Plans</h1>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products?.map((product) => (
            product.prices.map((price) => {
              const isSelected = selectedPlan?.id === price.id;

              return (
                <button
                  key={price.id}
                  onClick={() => setSelectedPlan(price)}
                  className={`text-left flex flex-col gap-2 bg-white p-6 rounded-2xl shadow-md border transition-colors duration-200 cursor-pointer ${
                    isSelected ? 'border-[#0071e3] ring-2 ring-[#0071e3]/30' : 'border-[#d2d2d7]/60 hover:border-[#0071e3]/60'
                  }`}
                >
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">{product.name}</h2>
                  {product.description && (
                    <p className="text-sm text-[#6e6e73]">{product.description}</p>
                  )}
                  <p className="mt-2 text-2xl font-serif text-[#00409f]">
                    {price.amount} {price.currency}
                    {price.interval && <span className="text-sm text-[#6e6e73]"> / {price.interval}</span>}
                  </p>
                </button>
              )
            })
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          buttonStyle={ButtonStyles.primary}
          className="!text-base !py-2 !px-6"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}

export default PlansPage;
