import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StripeService } from '../../services/stripe'
import { useAuthStore } from '../../Store';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../router/routes';

const PricingPage: React.FC = () => {

  const [selectedPlan, setSelectedPlan] = useState<string>();
  const navigate = useNavigate();

  const { data: product, error, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => StripeService.getPricing(),
    enabled: useAuthStore.getState().isAuthenticated, // just when the user is authenticated
    retry: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const prices = product?.prices

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Something went wrong</div>

  return (
    <>
      Pricing Plans
      <div>
      {prices?.map((price) => (
        <div key={price.id}>
          <button onClick={() => {
            setSelectedPlan(price.id)
          }}>
            { `${price.id} - ${price.amount} - ${price.currency} - ${price.interval} - ${price.type}` }
          </button>
        </div>
      ))}
    </div>
    <button
      onClick={() => {
        if(selectedPlan){
          navigate(routes.checkout.path.split('/').slice(0, -1).join('/') + `/${selectedPlan}`);
        }
      }}
    >
      Continue to Payment
    </button>
    </>
  )
}

export default PricingPage